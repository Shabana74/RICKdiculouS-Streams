import React from 'react';
import Store from "../context/store";
import { ApplicationFooter } from './components/application-footer';
import { ApplicationHeader } from './components/application-header';
import { ApplicationLayout } from './components/application-layout';

export const Application = React.memo(function Application({ children }) {
	return (
    <Store>
      <ApplicationLayout>
        <ApplicationHeader />

        <div className={"a-application-wrapper"}>
          <div style={{ flex: 1 }}>{children}</div>

          <ApplicationFooter />
        </div>

        <style jsx>{`
          .a-application-wrapper {
            width: 100%;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
        `}</style>
      </ApplicationLayout>
    </Store>
  );
});
