# Payroll & Sales Management System — Requirements Document

## 1. Employee Registration

Capture the following details for each employee:

| Field | Description |
|---|---|
| Name | Employee full name |
| Contact Number | Phone/mobile number |
| Address | Residential address |
| Citizenship Number | National ID / citizenship number |
| Basic Salary | Employee's base salary |
| Food (Yes/No) | Whether food facility is provided |
| Accommodation (Yes/No) | Whether accommodation facility is provided |
| Daily Working Hours | Standard working hours per day |
| OT Applicable (Yes/No) | Whether employee is eligible for overtime |
| OT Rate Setup | Overtime rate configuration (e.g., 1.5x, 2x of hourly rate) |
| Basic Salary Multiplier (times) | Multiplier factor used for salary/OT rate calculation |
| Monthly Salary Formula | Calculated as: **No. of Working Days × Daily Working Hours** (basis for hourly rate derivation) |

**Notes:**
- Hourly rate should be derived from Basic Salary ÷ (No. of Working Days × Daily Working Hours).
- OT rate should be configurable as a multiple of the hourly rate.

---

## 2. Calendar Setup

- Define **Month** and **Number of Working Days** for that month (to account for holidays, weekends, etc.).
- This working-day count feeds into the payroll/hourly-rate calculation.

---

## 3. Attendance Entry

Record daily attendance per employee:

| Field | Description |
|---|---|
| Employee Name | Select from registered employees |
| In Time | Clock-in time |
| Out Time | Clock-out time |

- System should calculate total worked hours per day (Out − In) automatically.

---

## 4. Payroll Calculation

- **Monthly to Hourly Conversion:** Convert monthly salary into an hourly rate using the formula:
  `Hourly Rate = Basic Salary / (Working Days × Daily Working Hours)`
- **Overtime (OT) Calculation:** If actual worked hours exceed the standard daily working hours, calculate OT pay as per the configured OT rate (from Employee Registration).
- Final payroll = (Regular Hours × Hourly Rate) + (OT Hours × OT Rate), plus any Food/Accommodation adjustments as applicable.

---

## 5. Payroll Print / Salary Payment

- Generate and print payroll slips for employees based on calculated payroll data.
- **Salary Payment Entry:** Record actual salary payments made to employees (date, amount, mode of payment, etc.), linked to the payroll calculation above.

---

## 6. SMS Information Setup

Configure SMS notification rules:

| Field | Description |
|---|---|
| SMS Send Time | When the SMS should be sent (specific time/schedule) |
| Recipient | Who should receive the information |
| Send Period/Frequency | How often the SMS should be sent (daily, weekly, monthly, etc.) |

---

## 7. SMS Notification (Due Payment Reminder)

**Search/Filter Criteria:**
- Party Category
- Party Name
- Date

**Message Template:**

```
Hajurko {date} miti samma [due amount] baki raheko le athasigra bhuktani
garidinu huna anurod gardachau. Thap jankariko lagi [phone number] ma
samparka garnu hola.
```

*(Translation: "As of {date}, [due amount] remains outstanding. You are
requested to make payment at the earliest. For further information,
please contact [phone number].")*

**Placeholders to be dynamically filled:**
- `{date}` — Due date
- `[due amount]` — Outstanding amount
- `[phone number]` — Contact number for inquiries

---

## 8. Sales Return

- Select the original **Sale/Payment** to process a return.
- Capture **Return Date**.
- Filter/report by **From Date – To Date** range showing:
  - Total Sales in the period
  - Total Returns in the period
  - Net Sales (Total Sales − Total Returns) in the period

---

## Summary of Modules

1. Employee Registration
2. Calendar Setup
3. Attendance Entry
4. Payroll Calculation
5. Payroll Print & Salary Payment
6. SMS Information Setup
7. SMS Notification (Due Reminders)
8. Sales Return