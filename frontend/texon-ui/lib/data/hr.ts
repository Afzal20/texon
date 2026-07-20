export interface Employee {
  id: number
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  department: number
  department_name?: string
  designation: number
  designation_name?: string
  status: string
  employment_type: string
}

export interface Attendance {
  id: number
  employee: number
  employee_name?: string
  date: string
  check_in: string
  check_out: string
  status: string
}

export interface ScheduleEntry {
  id: number
  department: string
  shift: string
  date: string
  staff_required: number
  staff_assigned: number
  status: string
}

export interface ShiftSchedule {
  id: number
  production_line: number
  line_name: string
  schedule_date: string
  start_time: string
  end_time: string
  staff_count: number
  max_capacity: number
}
