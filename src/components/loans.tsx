import React from 'react';
import { Spinner, HTMLTable } from '@blueprintjs/core';
import { useQuery } from 'react-query';
import { getLoanAccounts } from '../utils/api';
import type { LoanAccount } from '../utils/api';
import { useGlobalState } from '../utils/state';
import { CONNECTION, LOAN } from '../constants';

interface Props {
  loanProgramId: string;
}

const Loans = (props: Props): JSX.Element => {
  const [connection] = useGlobalState(CONNECTION);
  const loanQuery = async () => getLoanAccounts({ ...props, connection });
  const { isLoading, error, data } = useQuery(LOAN, loanQuery);

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <span>Error...</span>;
  }

  return (
    <HTMLTable>
      <tbody>
        <tr>
          <th>id</th>
          <th>amount</th>
          <th>status</th>
        </tr>
        {data &&
          data.map((loan: LoanAccount) => (
            <tr key={loan.id}>
              <td>{loan.id}</td>
              <td>{loan.expectedAmount}</td>
              <td>{loan.status}</td>
            </tr>
          ))}
      </tbody>
    </HTMLTable>
  );
};

export { Loans };
