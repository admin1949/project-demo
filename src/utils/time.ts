import { dayjs } from "element-plus";

export interface TimeSurplus {
  type: "DOING" | "END";
  timeOut: boolean;
  day: null | number;
  hours: null | number | string;
  minutes: null | number | string;
  second: null | number | string;
  totalNumber: null | number;
  surplusNumber: null | number;
  surplusPercentage: null | number;
}

export const fillNumber = (num: number) => {
  const str = num.toString();
  if (str.length > 1) {
    return str;
  }
  return "0" + str;
};

// 结束 累计消耗时间 相关
export function elapsedTime(
  startTime: string,
  updateTime: string,
  endTime: string,
  type: "DOING" | "END"
) {
  if (type === "DOING") {
    startTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
  }
  if (type === "END") {
    endTime = updateTime;
  }
  const day = dayjs(endTime).diff(startTime, "day");
  let hours = dayjs(endTime).diff(startTime, "hour");
  let minutes = dayjs(endTime).diff(startTime, "minutes");
  let second = dayjs(endTime).diff(startTime, "second");
  hours = hours - Math.floor(hours / 24) * 24;
  minutes = minutes - Math.floor(minutes / 60) * 60;
  second = second - Math.floor(second / 60) * 60;
  const totalNumber = dayjs(endTime).diff(startTime, "second");
  const surplusNumber = dayjs(startTime).diff(startTime, "second");

  const timeSurplus: TimeSurplus = {
    type: type,
    timeOut: false,
    day: null,
    hours: null,
    minutes: null,
    second: null,
    totalNumber: null,
    surplusNumber: null,
    surplusPercentage: null,
  };
  if (day < 0 || hours < 0 || minutes < 0 || second < 0) {
    hours = dayjs().diff(endTime, "hour");
    minutes = dayjs().diff(endTime, "minutes");
    second = dayjs().diff(endTime, "second");

    timeSurplus.timeOut = true;
    timeSurplus.surplusPercentage = 0;
    timeSurplus.day = dayjs().diff(endTime, "day");
    timeSurplus.hours = hours - Math.floor(hours / 24) * 24;
    timeSurplus.minutes = minutes - Math.floor(minutes / 60) * 60;
    timeSurplus.second = second - Math.floor(second / 60) * 60;
    timeSurplus.totalNumber = dayjs().diff(endTime, "second");
  } else {
    timeSurplus.day = day;
    timeSurplus.hours = fillNumber(hours);
    timeSurplus.minutes = fillNumber(minutes);
    timeSurplus.second = fillNumber(second);
    timeSurplus.totalNumber = totalNumber;
    timeSurplus.surplusNumber = surplusNumber;
    timeSurplus.surplusPercentage = (surplusNumber / totalNumber) * 100;
  }
  // console.log(JSON.stringify(timeSurplus))
  return timeSurplus;
}

const sec = 1000;
const min = sec * 60;
const hour = min * 60;
const day = hour * 24;
const month = day * 30;
const year = month * 12;

const timelist = [
  { unit: "年", t: year },
  { unit: "月", t: month },
  { unit: "天", t: day },
  { unit: "小时", t: hour },
  { unit: "分", t: min },
  { unit: "秒", t: sec },
];

export const getTimeString = (time: number, units = timelist) => {
  return units.reduce((i, j) => {
    if (j.t > time) {
      return i;
    }
    const num = Math.floor(time / j.t);
    time = time % j.t;
    return i + num + j.unit;
  }, "");
};

export const timeUnit = {
  sec,
  min,
  hour,
  day,
  month,
  year,
};
