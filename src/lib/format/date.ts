import { dayjs } from "@/lib/dayjs";

export const formatDate = (date: Date | string) => {
  return dayjs(date).format("MMMM D, YYYY");
};
