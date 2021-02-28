import React from 'react';
import { Spinner, HTMLTable } from '@blueprintjs/core';
import { useQuery } from 'react-query';
import { getLoanAccounts } from '../utils/api';
import type { LoanAccount } from '../utils/api';
import { useGlobalState } from '../utils/state';
import { CONNECTION, LOAN } from '../constants';

interface Props {
  loanProgramId: string;
  initializer?: string;
}

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

const Loans = (props: Props): JSX.Element => {
  const { initializer } = props;
  const [connection] = useGlobalState(CONNECTION);
  const loanQuery = async () => getLoanAccounts({ ...props, connection });
  const { isLoading, error, data } = useQuery(LOAN, loanQuery);

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <span>Error...</span>;
  }

  let loans: LoanAccount[] = data || [];
  if (initializer) {
    loans = loans.filter((item) => item.initializerPubkey === initializer);
  }

  return (
    <div className="column">
      <HTMLTable>
        <tbody>
          <tr>
            <th>ID</th>
            <th>Amount</th>
            <th>Duration (hours)</th>
            <th>APR</th>
            <th>status</th>
          </tr>
          {loans.map((loan) => (
            <tr key={loan.id}>
              <td>{loan.id}</td>
              <td>{loan.expectedAmount}</td>
              <td>{loan.duration}</td>
              <td>{loan.interestRate}%</td>
              <td>{getStatusForUI(loan.status)}</td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    </div>
  );
};

export { Loans };
