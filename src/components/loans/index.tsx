import React from 'react';
import { Spinner, HTMLTable } from '@blueprintjs/core';
import { useQuery } from 'react-query';
import { getLoanAccounts } from '../../utils/api';
import type { LoanAccount } from '../../utils/api';
import { useGlobalState } from '../../utils/state';
import { CONNECTION, LOAN } from '../../constants';
import { LoanStatus, getStatusForUI } from './helpers';
export * from './accept_loans';
export * from './guarantee_loans';
export * from './my_loans';

interface Filters {
  excludeStatus?: LoanStatus[];
  initializer?: string;
  status?: LoanStatus[];
}

interface Props {
  Component?: React.ElementType;
  filters?: Filters;
  loanProgramId: string;
}

const Loans = (props: Props): JSX.Element => {
  const { Component, loanProgramId } = props;
  const [connection] = useGlobalState(CONNECTION);
  const loanQuery = async () => getLoanAccounts({ loanProgramId, connection });
  const { isLoading, error, data } = useQuery(LOAN, loanQuery);

  const { filters } = props;

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <span>Error...</span>;
  }

  let loans: LoanAccount[] = data || [];
  if (filters) {
    if (filters.initializer) {
      loans = loans.filter((item) => item.initializerPubkey === filters.initializer);
    }
    if (filters.status) {
      loans = loans.filter((item) => filters.status?.includes(item.status));
    } else if (filters.excludeStatus) {
      loans = loans.filter((item) => !filters.excludeStatus?.includes(item.status));
    }
  }

  if (Component) {
    return (
      <div className="column">
        <Component loans={loans} />
      </div>
    );
  } else {
    return (
      <div className="column">
        <HTMLTable>
          <tbody>
            <tr>
              <th>ID</th>
              <th>Amount</th>
              <th>Duration (hours)</th>
              <th>APR</th>
              <th>Status</th>
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
  }
};

export { Loans };
