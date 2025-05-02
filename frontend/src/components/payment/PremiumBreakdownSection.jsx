import React, { useEffect, useState } from 'react';
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
    Divider,
    Skeleton,
    Alert
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useGetApplicationPremiumQuery } from '../../slices/createApiSlice';

function PremiumBreakdownSection({ premiumData, applicationNumber, paymentMode = 'monthly' }) {
    const [selectedPremium, setSelectedPremium] = useState(null);
    const { data: dbPremiumData, isLoading, error } = useGetApplicationPremiumQuery(
        applicationNumber,
        { skip: !applicationNumber }
    );

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return '$0.00';
        return `$${parseFloat(amount).toFixed(2)}`;
    };

    useEffect(() => {
        if (dbPremiumData) {
            switch (paymentMode) {
                case 'monthly':
                    setSelectedPremium(dbPremiumData.monthlyPremium);
                    break;
                case 'quarterly':
                    setSelectedPremium(dbPremiumData.quarterlyPremium);
                    break;
                case 'semi_annually':
                    setSelectedPremium(dbPremiumData.semiAnnualPremium);
                    break;
                case 'annually':
                    setSelectedPremium(dbPremiumData.annualPremium);
                    break;
                default:
                    setSelectedPremium(dbPremiumData.monthlyPremium);
            }
        } else if (premiumData?.base?.premium) {
            const basePremium = premiumData.base.premium;

            switch (paymentMode) {
                case 'monthly':
                    setSelectedPremium(basePremium);
                    break;
                case 'quarterly':
                    setSelectedPremium(basePremium * 3);
                    break;
                case 'semi_annually':
                    setSelectedPremium(basePremium * 6);
                    break;
                case 'annually':
                    setSelectedPremium(basePremium * 12);
                    break;
                default:
                    setSelectedPremium(basePremium);
            }
        } else if (error || (!isLoading && !dbPremiumData && !premiumData?.base?.premium)) {
            // Use demo values if we have no data at all
            const demoMonthly = 105.75;

            switch (paymentMode) {
                case 'monthly':
                    setSelectedPremium(demoMonthly);
                    break;
                case 'quarterly':
                    setSelectedPremium(demoMonthly * 3);
                    break;
                case 'semi_annually':
                    setSelectedPremium(demoMonthly * 6);
                    break;
                case 'annually':
                    setSelectedPremium(demoMonthly * 12);
                    break;
                default:
                    setSelectedPremium(demoMonthly);
            }
        }
    }, [dbPremiumData, paymentMode, premiumData, error, isLoading]);

    const basePremium = selectedPremium || 0;
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

    const getPaymentFrequencyLabel = () => {
        switch (paymentMode) {
            case 'monthly':
                return 'Monthly';
            case 'quarterly':
                return 'Quarterly';
            case 'semi_annually':
                return 'Semi-Annual';
            case 'annually':
                return 'Annual';
            default:
                return 'Monthly';
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ mt: 2, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Premium Amount & Breakdown
                </Typography>
                <Skeleton variant="rectangular" height={100} />
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <AttachMoneyIcon sx={{ mr: 1 }} />
                Premium Amount & Breakdown
            </Typography>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Coverage Type</TableCell>
                            <TableCell align="right">{getPaymentFrequencyLabel()} Premium</TableCell>
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
                            <TableCell sx={{ fontWeight: 'bold' }}>Total {getPaymentFrequencyLabel()} Premium</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {formatCurrency(totalPremium)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default PremiumBreakdownSection; 