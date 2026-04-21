import { DownloadResult } from '../types';

export const requestDownload = async (fileUrl: string, courseTitle: string): Promise<DownloadResult> => {
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return {
      kind: 'external',
      destination: fileUrl,
    };
  }

  return {
    kind: 'mock',
    destination: `${courseTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`,
  };
};
