import React from 'react'
import "./App.css";
import { FicheDecisionPDf } from './ficheDecisionComponent';

export const FicheDecision = () => ( 

    <div
      style={{
        width: "100%",
        justifyContent: "center",
        alignSelf: "center",
        alignContent: "center",
        alignItems: "center",
        display: 'flex'
      }}>
      <div style={{padding:3,marginLeft:10}}>
        <FicheDecisionPDf />
      </div>

      <div style={{padding:3,marginLeft:10}}>
        <FicheDecisionPDf />
      </div>
    </div>
  );


