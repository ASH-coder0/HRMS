const nepaliDateConverter = require('nepali-date-converter');
const NepaliDate = nepaliDateConverter.default || nepaliDateConverter;
const CustomErrorHandler = require('../utils/CustomErrorHandler');

// English transliterations
const BS_MONTH_NAMES = [
  'Baisakh', // 1
  'Jestha',
  'Ashad',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra', // 12
];


//using this beause js date can contain extra date 2XXX-XX-XX XXXZ which so we need XXX-XX-XX in db. and padStart makes format 2 to 02
const toAdDateOnly = (jsDate) => {
  const d = new Date(jsDate);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Convert a Bikram Sambat (year, month) to its AD date range.
 * @param {number} bsYear e.g. 2083
 * @param {number} bsMonth 1..12 (1 = Baisakh)
 * @returns {{ bsYear:number, bsMonth:number, monthName:string, startDateAd:string, endDateAd:string }}
 */

//get gives month of the particular given year like (2082, 2) so this shall return jesth
const getBsMonthRange = (bsYear, bsMonth) => {
  const y = Number(bsYear);
  const m = Number(bsMonth);
  if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12 || y < 1975 || y > 2100) {
    throw CustomErrorHandler.validationError('Invalid Bikram Sambat year/month');
  }

  const startBs = new NepaliDate(y, m - 1, 1); //m-1 beause the arry starts form 0 to ...... so 1-1 will be (1-1) index has baishak on 0 so..

  //if  12 crosss so it should go to next year like 2083-12 to 2084-1 and another remains same that is m
  const nextMonth = m === 12 ? new NepaliDate(y + 1, 0, 1) : new NepaliDate(y, m, 1);
  const endDate = nextMonth.toJsDate();
  endDate.setDate(endDate.getDate() - 1);

  return {
    bsYear: y,
    bsMonth: m,
    monthName: BS_MONTH_NAMES[m - 1],
    startDateAd: toAdDateOnly(startBs.toJsDate()),
    endDateAd: toAdDateOnly(endDate),
  };
};

/** "Jestha 2083" */
const bsMonthLabel = ({ bsYear, bsMonth }) =>
  `${BS_MONTH_NAMES[Number(bsMonth) - 1]} ${bsYear}`;

/** "21 Poush 2083" */
const formatBsDate = (jsDate) => {
  const bs = new NepaliDate(new Date(jsDate));
  return `${bs.getDate()} ${BS_MONTH_NAMES[bs.getMonth()]} ${bs.getYear()}`;
};

// "2083-09-21" numeric BS format 
const formatBsNumeric = (jsDate) => {
  const bs = new NepaliDate(new Date(jsDate));
  const y = bs.getYear();
  const m = String(bs.getMonth() + 1).padStart(2, '0');
  const d = String(bs.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};


//  List every BS month that overlaps the given AD date range, in order.
// Used to build payroll period pickers from an economic year's start/end dates.

const listBsMonthsBetween = (startDateAd, endDateAd) => {
  const start = new NepaliDate(new Date(`${startDateAd}T00:00:00`));
  const end = new NepaliDate(new Date(`${endDateAd}T00:00:00`));

  const months = [];
  let cursorYear = start.getYear();
  let cursorMonth = start.getMonth(); // 0-based

  while (
    cursorYear < end.getYear() ||
    (cursorYear === end.getYear() && cursorMonth <= end.getMonth())
  ) {
    const range = getBsMonthRange(cursorYear, cursorMonth + 1);
    months.push({
      value: `${cursorYear}-${cursorMonth + 1}`,
      bs_year: cursorYear,
      bs_month: cursorMonth + 1,
      label: bsMonthLabel({ bsYear: cursorYear, bsMonth: cursorMonth + 1 }),
      start_date_ad: range.startDateAd,
      end_date_ad: range.endDateAd,
    });

    cursorMonth += 1;
    if (cursorMonth > 11) {
      cursorMonth = 0;
      cursorYear += 1;
    }
  }

  return months;
};

module.exports = {
  BS_MONTH_NAMES,
  getBsMonthRange,
  bsMonthLabel,
  formatBsDate,
  formatBsNumeric,
  listBsMonthsBetween,
  toAdDateOnly,
};
