import TimeAgo from "javascript-time-ago";

export const TimeSince = (date) => {
  let news_date = new Date(date);

  let get_time_since = new TimeAgo("en-US");
  return [news_date.toLocaleDateString("en-US", {dateStyle:"medium"}), get_time_since.format(news_date)];
};
