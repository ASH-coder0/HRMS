const Salary = require('../../models/Salary');
const EconomicYear = require('../../models/EconomicYear');
const CustomErrorHandler = require('../utils/CustomErrorHandler');
const { monthlyReport } = require('./attendanceServices');
const {
  getBsMonthRange,
  bsMonthLabel,
  listBsMonthsBetween,
} = require('../helpers/bsDate');


const economicYearToAdRange = (economicYear) => {
  //get start yer 
  const startParts = String(economicYear.start_date).split('-');
  const endParts = String(economicYear.end_date).split('-');

 
  const labelYears = (String(economicYear.economic_year || '').match(/\d{4}/g) || []).map(Number);
  const startYear = Number(startParts[0]);
  const looksBs = labelYears.length > 0
    ? labelYears.includes(startYear)
    : startYear >= 2000;

  if (looksBs) {
    return {
      startDateAd: getBsMonthRange(startParts[0], startParts[1]).startDateAd,
      endDateAd: getBsMonthRange(endParts[0], endParts[1]).endDateAd,
      storedCalendar: 'bs',
    };
  }

  return {
    startDateAd: economicYear.start_date,
    endDateAd: economicYear.end_date,
    storedCalendar: 'ad',
  };
};

const resolveBsYearForMonth = async (economic_year_id, month) => {
  if (!economic_year_id) throw CustomErrorHandler.validationError('economic_year_id or year is required');

  const economicYear = await EconomicYear.findByPk(economic_year_id);
  if (!economicYear) throw CustomErrorHandler.notFound('Economic year not found');

  const { startDateAd, endDateAd } = economicYearToAdRange(economicYear);
  const months = listBsMonthsBetween(startDateAd, endDateAd);
  const match = months.find((m) => m.bs_month === Number(month));
  if (!match) throw CustomErrorHandler.validationError('Selected month does not belong to this economic year');

  return match.bs_year;
};

//we used this to display months of the selected economic year months
const listPayrollPeriods = async (economic_year_id) => {
  if (!economic_year_id) throw CustomErrorHandler.validationError('economic_year_id is required');

  const economicYear = await EconomicYear.findByPk(economic_year_id);
  if (!economicYear) throw CustomErrorHandler.notFound('Economic year not found');

  const { startDateAd, endDateAd, storedCalendar } = economicYearToAdRange(economicYear);
  const months = listBsMonthsBetween(startDateAd, endDateAd);

  return {
    economic_year_id: economicYear.id,
    economic_year: economicYear.economic_year,
    stored_calendar: storedCalendar,
    start_date_ad: startDateAd,
    end_date_ad: endDateAd,
    months,
  };
};

const countWorkingDays = (startDateAd, endDateAd) => {
  const start = new Date(`${startDateAd}T00:00:00`);
  const end = new Date(`${endDateAd}T00:00:00`);
  let count = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 6) count += 1; // 6 = Saturday
  }
  return count;
};

const calculateNetSalary = async ({ employee_id, month, year, economic_year_id }) => {
  if (!employee_id) throw CustomErrorHandler.validationError('employee_id is required');
  if (!month || Number(month) < 1 || Number(month) > 12) {
    throw CustomErrorHandler.validationError('month must be between 1 and 12');
  }

  // Resolve the Bikram Sambat year: either given explicitly, or derived from
  // the selected economic year (handles fiscal years spanning two BS years).
  let bsYear = year != null && year !== '' ? Number(year) : null;
  if (!bsYear) bsYear = await resolveBsYearForMonth(economic_year_id, month);

  // Convert the BS month to its AD date range because attendance stores AD dates.
  const bsRange = getBsMonthRange(bsYear, month);
  const { startDateAd, endDateAd } = bsRange;
  const periodLabel = bsMonthLabel({ bsYear: bsRange.bsYear, bsMonth: bsRange.bsMonth });

  const salary = await Salary.findOne({
    where: { employee_id, end_date: null },
    order: [['effective_date', 'DESC']],
  });
  if (!salary) throw CustomErrorHandler.notFound('No salary structure found for this employee');

  const basic = (Number(salary.basic_salary) || 0) * (Number(salary.basic_salary_multiplier) || 1);
  const housing = Number(salary.housing_allowance) || 0;
  const transport = Number(salary.transport_allowance) || 0;
  const medical = Number(salary.medical_allowance) || 0;
  const other = Number(salary.other_allowance) || 0;
  const food = salary.food_enabled ? Number(salary.food_allowance) || 0 : 0;
  const accommodation = salary.accommodation_enabled ? Number(salary.accommodation_allowance) || 0 : 0;
  const grossMonthly = basic + housing + transport + medical + other + food + accommodation;

  const dailyWorkingHours = Number(salary.daily_working_hours) || 8;

  const period = {
    label: periodLabel,
    bs: {
      year: bsRange.bsYear,
      month: bsRange.bsMonth,
      month_name: bsRange.monthName,
      start_date: `${bsRange.bsYear}-${String(bsRange.bsMonth).padStart(2, '0')}-01`,
    },
    ad: {
      start_date: startDateAd,
      end_date: endDateAd,
    },
  };

  const { records, summary } = await monthlyReport({
    employee_id,
    start_date: startDateAd,
    end_date: endDateAd,
  });

  //this is for monthly days wokrking hr
  const workingDays = countWorkingDays(startDateAd, endDateAd);
  const requiredMonthlyHours = workingDays * dailyWorkingHours;

  // Worked hours = whatever was actually recorded (absent/on_leave rows carry 0).
  const totalWorkedHours = records.reduce(
    (sum, record) => sum + (Number(record.total_hour) || 0),
    0
  );

  const hourlyRate = requiredMonthlyHours > 0 ? grossMonthly / requiredMonthlyHours : 0;

  // Deduct when the employee does not meet the required monthly hours.
  const shortfallHours = Math.max(requiredMonthlyHours - totalWorkedHours, 0);
  const absenceDeduction = Math.min(shortfallHours * hourlyRate, grossMonthly);

  // Pay overtime when the employee exceeds the required monthly hours.
  const excessHours = Math.max(totalWorkedHours - requiredMonthlyHours, 0);
  const overtimeHours = excessHours;
  const otPay = salary.ot_enabled
    ? excessHours * hourlyRate * (Number(salary.ot_rate) || 1.5)
    : 0;

  const netPay = Math.max(grossMonthly - absenceDeduction + otPay, 0);

  return {
    employee_id,
    month: bsRange.bsMonth,
    year: bsRange.bsYear,
    period,
    daysInMonth: workingDays,
    workingDays,
    requiredMonthlyHours,
    totalWorkedHours,
    shortfallHours,
    salary,
    earnings: { basic, housing, transport, medical, other, food, accommodation, grossMonthly },
    perDayRate: hourlyRate * dailyWorkingHours,
    unpaidDays: dailyWorkingHours > 0 ? Math.max(shortfallHours / dailyWorkingHours, 0) : 0,
    absenceDeduction,
    hourlyRate,
    overtimeHours,
    otPay,
    netPay,
    summary,
  };
};

module.exports = { calculateNetSalary, listPayrollPeriods };
