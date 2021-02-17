import React from 'react';
import { Button, ButtonGroup } from '@blueprintjs/core';

import '@blueprintjs/core/lib/css/blueprint.css';
import 'milligram/dist/milligram.css';

/**
 *
 */
export default function App(): JSX.Element {
  return (
    <div className="container">
      <div className="row">
        <div className="column">
          <h2>DeFi Loans</h2>
        </div>
      </div>
      <div className="row">
        <div className="column">
          <ButtonGroup vertical={true} minimal={true}>
            <Button icon="database">Queries</Button>
            <Button icon="function">Functions</Button>
          </ButtonGroup>
        </div>
        <div className="column column-75">.column</div>
      </div>
    </div>
  );
}
