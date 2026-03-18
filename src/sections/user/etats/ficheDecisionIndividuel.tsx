import React from 'react';
import "./App.css";
import { FicheDecisionIndividuelPDf } from './ficheDecisionIndividuels';

export const FicheIndividuelDecision = () => (
  <div
    style={{
      width: "100%",
      justifyContent: "center",
      alignSelf: "center",
      alignContent: "center",
      alignItems: "center",
      display: 'flex'
    }}
  >
    <div style={{ padding: 3, marginLeft: 10 }}>
      <FicheDecisionIndividuelPDf />
    </div>

    <div style={{ padding: 3, marginLeft: 10 }}>
      <FicheDecisionIndividuelPDf />
    </div>
  </div>
);