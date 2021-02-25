import React from 'react';
import { Spinner, HTMLTable } from '@blueprintjs/core';
import { useQuery } from 'react-query';
import type { Connection } from '@solana/web3.js';
import { getLoanAccounts } from '../utils/api';
import type { LoanAccount } from '../utils/api';
import { LOAN } from '../constants';

interface Props {
  connection: Connection;
  loanProgramId: string;
}

const Loans = (props: Props): JSX.Element => {
  const loanQuery = async () => getLoanAccounts(props);
  const { isLoading, error, data } = useQuery(LOAN, loanQuery);

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <span>Error...</span>;
  }

  return (
    <HTMLTable>
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
    </HTMLTable>
  );
};

export { Loans };
