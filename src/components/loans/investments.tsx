import React from 'react';
import { HTMLTable, H3 } from '@blueprintjs/core';
import { useGlobalState } from '../../utils/state';
import type { LoanAccount } from '../../utils/api';
import { getStatusForUI } from './helpers';
import { WALLET } from '../../constants';

interface Props {
  loans: LoanAccount[];
}

const Investments = (props: Props): JSX.Element => {
  const { loans } = props;
  const [wallet] = useGlobalState(WALLET);

  const getInvestmentType = (loan: LoanAccount): string => {
    const investmentTypes: string[] = [];
    if (loan.guarantorPubkey === wallet.publicKey.toBase58()) {
      investmentTypes.push('Guarantor');
    }
    if (loan.lenderPubkey === wallet.publicKey.toBase58()) {
      investmentTypes.push('Lender');
    }
    return investmentTypes.join(', ');
  };

  return (
    <div className="my-investments">
      <H3>My Investments</H3>
      {loans.length > 0 ? (
        <HTMLTable>
          <tbody>
            <tr>
              <th>ID</th>
              <th>Amount</th>
              <th>Duration (hours)</th>
              <th>APR</th>
              <th>Status</th>
              {wallet && wallet._publicKey && <th>Type</th>}
            </tr>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.id}</td>
                <td>{loan.expectedAmount}</td>
                <td>{loan.duration}</td>
                <td>{loan.interestRate}%</td>
                <td>{getStatusForUI(loan.status)}</td>
                {wallet && wallet._publicKey && <td>{getInvestmentType(loan)}</td>}
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

export { Investments };
