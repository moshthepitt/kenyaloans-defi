import React from 'react';
import { Link } from 'react-router-dom';
import { Button, HTMLTable, H3 } from '@blueprintjs/core';
import { useGlobalState } from '../../utils/state';
import type { LoanAccount } from '../../utils/api';
import { getStatusForUI } from './helpers';
import { URL_ACCEPT, WALLET } from '../../constants';

interface Props {
  loans: LoanAccount[];
}

const AcceptLoans = (props: Props): JSX.Element => {
  const { loans } = props;
  const [wallet] = useGlobalState(WALLET);
  return (
    <div className="accept">
      <H3>Lend Funds</H3>
      {loans.length > 0 ? (
        <HTMLTable>
          <tbody>
            <tr>
              <th>ID</th>
              <th>Amount</th>
              <th>Duration (hours)</th>
              <th>APR</th>
              <th>Status</th>
              {wallet && wallet._publicKey && <th>Action</th>}
            </tr>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.id}</td>
                <td>{loan.expectedAmount}</td>
                <td>{loan.duration}</td>
                <td>{loan.interestRate}%</td>
                <td>{getStatusForUI(loan.status)}</td>
                {wallet && wallet._publicKey && (
                  <td>
                    <Link to={`${URL_ACCEPT}/${loan.id}`}>
                      <Button
                        text="  "
                        small={true}
                        minimal={true}
                        style={{ height: '20px' }}
                        rightIcon="arrow-right"
                        intent="success"
                      />
                    </Link>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      ) : (
        <p>No loans are currently available</p>
      )}
    </div>
  );
};

export { AcceptLoans };
