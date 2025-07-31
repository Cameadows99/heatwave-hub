export type OrderRequest = {
  id: string;
  requestName: string;
  date: Date;
  items: string[];
  details?: string;
  reason?: string;
  ordered: boolean;
};
