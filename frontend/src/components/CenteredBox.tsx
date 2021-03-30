import { Box } from "@chakra-ui/react";
import React from "react";

const CenteredBox: React.FC<{ width?: number }> = ({
  children,
  width = 800,
}) => {
  return (
    <Box
      position="fixed"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      width={width}
      border="1px"
      borderColor="gray.400"
      borderRadius="8px"
      padding={8}
    >
      {children}
    </Box>
  );
};

export default CenteredBox;
