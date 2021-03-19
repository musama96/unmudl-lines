export interface StripeCoupon {
  id: string;
  currency: string;
  percent_off: number;
  duration: string;
  max_redemptions?: number;
  redeem_by?: Date;
}
