import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Divider
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

function PremiumBreakdownSection({ premiumData }) {
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return '$0.00';
        return `$${parseFloat(amount).toFixed(2)}`;
    };

    const basePremium = premiumData?.base?.premium || 0;
    const additionalPremiums = premiumData?.additional || [];
    const riderPremiums = premiumData?.riders || [];

    const calculateTotal = () => {
        let total = parseFloat(basePremium || 0);

        additionalPremiums.forEach(item => {
            total += parseFloat(item.premium || 0);
        });

        riderPremiums.forEach(item => {
            total += parseFloat(item.premium || 0);
        });

        return total;
    };

    const totalPremium = calculateTotal();
    const hasAdditionalCoverages = additionalPremiums.length > 0;
    const hasRiders = riderPremiums.length > 0;

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <AttachMoneyIcon sx={{ mr: 1 }} />
                Premium Amount & Breakdown
            </Typography>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Coverage Type</TableCell>
                            <TableCell align="right">Premium</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell component="th" scope="row">Base Premium</TableCell>
                            <TableCell align="right">{formatCurrency(basePremium)}</TableCell>
                        </TableRow>

                        {hasAdditionalCoverages && additionalPremiums.map((item, index) => (
                            <TableRow key={`additional-${index}`}>
                                <TableCell component="th" scope="row">
                                    Additional Coverage {index + 1}
                                </TableCell>
                                <TableCell align="right">{formatCurrency(item.premium)}</TableCell>
                            </TableRow>
                        ))}

                        {hasRiders && riderPremiums.map((item, index) => (
                            <TableRow key={`rider-${index}`}>
                                <TableCell component="th" scope="row">
                                    {item.description || `Rider ${index + 1}`}
                                </TableCell>
                                <TableCell align="right">{formatCurrency(item.premium)}</TableCell>
                            </TableRow>
                        ))}

                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Total Premium</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {formatCurrency(totalPremium)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="textSecondary">
                    Note: Your premium is calculated based on the coverage options you selected.
                    The final premium may be adjusted after underwriting review.
                </Typography>
            </Box>
        </Paper>
    );
}

export default PremiumBreakdownSection; 