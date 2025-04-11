import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CollapsibleSection = ({
  title,
  isEnabled,
  isExpanded,
  isValid,
  onExpand,
  onDisabledClick,
  children,
  ownerId,
  sectionName,
  expandedSections
}) => {
  const sectionId = `section-${ownerId}-${sectionName}`;

  return (
    <div id={sectionId} style={{ marginBottom: '16px' }}>
      <Accordion
        expanded={isExpanded || expandedSections?.[`${ownerId}-${sectionName}`] || false}
        onChange={onExpand}
        disabled={!isEnabled}
        onClick={() => !isEnabled && onDisabledClick()}
        sx={{
          '&.Mui-disabled': {
            bgcolor: 'action.disabledBackground',
            cursor: 'pointer',
          },
          mb: 2
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isValid ? (
              <CheckCircleIcon color="success" />
            ) : (
              <></>
            )}
            {/* <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                fontSize: '1.1rem',
                color: '#333'
              }}
            >
              {title}
            </Typography> */}
            <Typography variant="h6" fontWeight="bold">{title}</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {children}
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default CollapsibleSection; 