export enum LoanStatus {
  Pending = 0,
  Initialized = 1,
  Guaranteed = 2,
  Accepted = 3,
  Repaid = 4,
}

export const getStatusForUI = (status: number): string => {
  switch (status) {
    case LoanStatus.Pending:
      return 'Pending';
    case LoanStatus.Initialized:
      return 'Initialized';
    case LoanStatus.Guaranteed:
      return 'Guaranteed';
    case LoanStatus.Accepted:
      return 'Accepted';
    case LoanStatus.Repaid:
      return 'Repaid';
    default:
      return 'Invalid';
  }
};
