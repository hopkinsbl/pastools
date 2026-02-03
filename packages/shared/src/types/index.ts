// Entity types
export enum TagType {
  AI = 'AI',
  AO = 'AO',
  DI = 'DI',
  DO = 'DO',
  PID = 'PID',
  Valve = 'Valve',
  Drive = 'Drive',
  Totaliser = 'Totaliser',
  Calc = 'Calc',
}

export enum AlarmPriority {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum TQStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  UnderReview = 'UnderReview',
  Answered = 'Answered',
  Approved = 'Approved',
  Closed = 'Closed',
}

export enum PunchlistCategory {
  A = 'A',
  B = 'B',
  C = 'C',
}

export enum PunchlistStatus {
  Open = 'Open',
  InProgress = 'InProgress',
  PendingVerification = 'PendingVerification',
  Closed = 'Closed',
}

export enum UserRole {
  Admin = 'Admin',
  Engineer = 'Engineer',
  Viewer = 'Viewer',
  Approver = 'Approver',
}

export enum JobType {
  Import = 'Import',
  Export = 'Export',
  Validation = 'Validation',
  TestRun = 'TestRun',
}

export enum JobStatus {
  Queued = 'Queued',
  Running = 'Running',
  Completed = 'Completed',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
}

export enum ValidationSeverity {
  Error = 'Error',
  Warning = 'Warning',
  Info = 'Info',
}

export enum AuditOperation {
  Create = 'Create',
  Update = 'Update',
  Delete = 'Delete',
  Link = 'Link',
  Unlink = 'Unlink',
}
