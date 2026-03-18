import React from "react";
import { useSelector } from 'react-redux';
import { Typography, Box, Divider } from '@mui/material';
import { IReduxState } from "../../../store/store";

export const HeaderPageComponents = (props: any) => {
  const { utilisateurData } = useSelector((state: IReduxState) => state.authentification);

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Box sx={{
            fontSize: 12,
            fontWeight: "bold",
            width: "50%",
            fontFamily: "arial",
            border: "1px solid hidden",
          }}>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 17,
                  textTransform: "uppercase",
                }}
              >
                {/* {paramEglise?.nomTemple} */}
              </Typography>
            </Box>
          </Box>

          <Box sx={{
            fontSize: 12,
            width: "50%",
            border: "1px solid hidden",
            fontFamily: "arial",
            alignContent: "flex-end",
            alignItems: "flex-end",
          }}>
            <Box
              sx={{
                display: "flex",
                width: "100%",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                alignSelf: "flex-end",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: 13,
                  fontWeight: "bold",
                  color: "black",
                }}
              >
                Tél église{" "}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 13,
                  ml: 0.625,
                  fontWeight: "bold",
                  color: "black",
                }}
              >
                {/* {" "} {paramEglise?.telephoneUtilisateur} */}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 0.625, display: 'flex', width: "100%" }}>
        <Divider 
          sx={{ 
            backgroundColor: "black", 
            width: "100%", 
            height: 1,
            mt: 0.0625,
          }} 
        />
      </Box>
    </Box>
  );
};