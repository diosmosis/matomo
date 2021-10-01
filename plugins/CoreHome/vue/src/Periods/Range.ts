import translate from "../translate";
import Periods from "./Periods";
import { parseDate, format, getToday, todayIsInRange } from './utilities';

export default class RangePeriod
{
  constructor(private startDate: Date, private endDate: Date, childPeriodType: string) {}

  parse(strDate, childPeriodType) {
    childPeriodType = childPeriodType || 'day';

    if (/^previous/.test(strDate)) {
      const endDate = getLastNRange(childPeriodType, '2').startDate;
      return getLastNRange(childPeriodType, strDate.substring(8), endDate);
    } else if (/^last/.test(strDate)) {
      return getLastNRange(childPeriodType, strDate.substring(4));
    } else {
      const parts = decodeURIComponent(strDate).split(',');
      return new RangePeriod(parseDate(parts[0]), parseDate(parts[1]), childPeriodType)
    }

    /**
     * Returns a range representing the last N childPeriodType periods, including the current one.
     */
    function getLastNRange(childPeriodType: string, strAmount: string, endDate?: Date): RangePeriod {
      const nAmount = Math.max(parseInt(strAmount) - 1, 0);
      if (isNaN(nAmount)) {
        throw new Error('Invalid range date: ' + strDate);
      }

      endDate = endDate ? parseDate(endDate) : getToday();

      let startDate = new Date(endDate.getTime());
      if (childPeriodType === 'day') {
        startDate.setDate(startDate.getDate() - nAmount);
      } else if (childPeriodType === 'week') {
        startDate.setDate(startDate.getDate() - (nAmount * 7));
      } else if (childPeriodType === 'month') {
        startDate.setDate(1);
        startDate.setMonth(startDate.getMonth() - nAmount);
      } else if (childPeriodType === 'year') {
        startDate.setFullYear(startDate.getFullYear() - nAmount);
      } else {
        throw new Error("Unknown period type '" + childPeriodType + "'.");
      }

      if (childPeriodType !== 'day') {
        const startPeriod = Periods.periods[childPeriodType].parse(startDate);
        const endPeriod = Periods.periods[childPeriodType].parse(endDate);

        startDate = startPeriod.getDateRange()[0];
        endDate = endPeriod.getDateRange()[1];
      }

      const firstWebsiteDate = new Date(1991, 7, 6);
      if (startDate - firstWebsiteDate < 0) {
        switch (childPeriodType) {
          case 'year':
            startDate = new Date(1992, 0, 1);
            break;
          case 'month':
            startDate = new Date(1991, 8, 1);
            break;
          case 'week':
            startDate = new Date(1991, 8, 12);
            break;
          case 'day':
          default:
            startDate = firstWebsiteDate;
            break;
        }
      }

      return new RangePeriod(startDate, endDate, childPeriodType);
    }
  }

  static getDisplayText() {
    return translate('General_DateRangeInPeriodList');
  }

  getPrettyString() {
    var start = format(this.startDate);
    var end = format(this.endDate);
    return translate('General_DateRangeFromTo', [start, end]);
  }

  getDateRange() {
    return [this.startDate, this.endDate];
  }

  containsToday() {
    return todayIsInRange(this.getDateRange());
  }
}

Periods.addCustomPeriod('range', RangePeriod);
