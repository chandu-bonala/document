import argparse
import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict

import firebase_admin
from firebase_admin import credentials, firestore
from google.auth.exceptions import DefaultCredentialsError


@dataclass
class SeedStats:
    written: int = 0
    validated: int = 0


def _load_seed(seed_path: Path) -> Dict[str, Dict[str, Dict[str, Any]]]:
    with seed_path.open("r", encoding="utf-8") as f:
        payload = json.load(f)

    if not isinstance(payload, dict):
        raise ValueError("Seed file must be a JSON object.")

    normalized: Dict[str, Dict[str, Dict[str, Any]]] = {}
    for collection_name, docs in payload.items():
        if not isinstance(docs, dict):
            raise ValueError(f"Collection '{collection_name}' must map to an object of docs.")

        parsed_docs: Dict[str, Dict[str, Any]] = {}
        for doc_id, doc_data in docs.items():
            if not isinstance(doc_data, dict):
                raise ValueError(f"Doc '{collection_name}/{doc_id}' must be an object.")
            parsed_docs[str(doc_id)] = doc_data
        normalized[str(collection_name)] = parsed_docs

    return normalized


def _initialize_firebase(project_id: str | None, service_account_path: str | None) -> firestore.Client:
    if firebase_admin._apps:
        return firestore.client()

    if service_account_path:
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred, {"projectId": project_id} if project_id else None)
    else:
        firebase_admin.initialize_app(options={"projectId": project_id} if project_id else None)

    return firestore.client()


def seed_and_validate(
    db: firestore.Client | None,
    seed_payload: Dict[str, Dict[str, Dict[str, Any]]],
    dry_run: bool,
) -> SeedStats:
    stats = SeedStats()

    for collection_name, docs in seed_payload.items():
        print(f"\nCollection: {collection_name} ({len(docs)} docs)")
        for doc_id, doc_data in docs.items():
            if dry_run:
                print(f"  [DRY-RUN] upsert {collection_name}/{doc_id}")
                _ = doc_data
                stats.validated += 1
            else:
                if db is None:
                    raise RuntimeError("Firestore client is not initialized.")
                ref = db.collection(collection_name).document(doc_id)
                ref.set(doc_data, merge=True)
                stats.written += 1
                print(f"  [WRITE] {collection_name}/{doc_id}")
                snapshot = ref.get()
                if snapshot.exists:
                    stats.validated += 1

    return stats


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed and validate Firestore collections from JSON.")
    parser.add_argument(
        "--seed-file",
        default="firestore.demo.seed.json",
        help="Path to seed JSON file (default: firestore.demo.seed.json)",
    )
    parser.add_argument(
        "--project-id",
        default=os.getenv("FIREBASE_PROJECT_ID", ""),
        help="Firebase project ID. Falls back to FIREBASE_PROJECT_ID env var.",
    )
    parser.add_argument(
        "--service-account",
        default=os.getenv("GOOGLE_APPLICATION_CREDENTIALS", ""),
        help="Path to Firebase service-account JSON. Falls back to GOOGLE_APPLICATION_CREDENTIALS env var.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print operations without writing.",
    )
    args = parser.parse_args()

    seed_path = Path(args.seed_file)
    if not seed_path.exists():
        raise FileNotFoundError(f"Seed file not found: {seed_path}")

    seed_payload = _load_seed(seed_path)
    db: firestore.Client | None = None
    if not args.dry_run:
        try:
            db = _initialize_firebase(
                project_id=args.project_id or None,
                service_account_path=args.service_account or None,
            )
        except DefaultCredentialsError as exc:
            raise RuntimeError(
                "Missing Google credentials. Set GOOGLE_APPLICATION_CREDENTIALS to a Firebase service-account JSON file, "
                "or pass --service-account <path>."
            ) from exc

    stats = seed_and_validate(db, seed_payload, args.dry_run)

    print("\nSummary")
    print(f"  Written docs : {stats.written}")
    print(f"  Validated docs: {stats.validated}")
    print("Done.")


if __name__ == "__main__":
    main()
