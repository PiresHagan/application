import createPremiumCalcRequest from './buildPremiumCalcRequest';
import { markPremiumOutdated } from '../slices/premiumSlice';

/**
 * Formats the raw premium calculation results into a structured format
 * @param {Object} calculationResult - Raw calculation result from the API
 * @returns {Object} - Formatted premium data
 */
export const formatPremiumResult = (calculationResult) => {
  // Extract the application GUID to find related keys
  const appGuid = Object.keys(calculationResult).find(key => 
    key.includes('_totalAnnualPremium')
  )?.split('_totalAnnualPremium')[0] || '';

  // Extract total premiums
  const totalAnnualPremium = calculationResult[`${appGuid}_totalAnnualPremium`] || 0;
  const totalMonthlyPremium = calculationResult[`${appGuid}_totalMonthlyPremium`] || 0;
  const totalQuarterlyPremium = calculationResult[`${appGuid}_totalQuarterlyPremium`] || 0;
  const totalSemiAnnualPremium = calculationResult[`${appGuid}_totalSemiAnnualPremium`] || 0;

  // Find individual coverage premiums
  const allPremiums = Object.entries(calculationResult)
    .filter(([key]) => key.endsWith('_premium') && !key.includes(appGuid))
    .map(([_, value]) => value);

  // Process collected premiums
  const basePremium = allPremiums[0] || 0;
  const additionalPremiums = allPremiums.slice(1);

  return {
    totalPremium: totalAnnualPremium.toFixed(2),
    basePremium: basePremium.toFixed(2),
    additionalPremiums: additionalPremiums.map(p => p.toFixed(2)),
    riderPremiums: [], // For future rider implementation
    calculationDate: new Date().toISOString(),
    frequency: 'Annual',
    annualPremium: totalAnnualPremium.toFixed(2),
    semiAnnualPremium: totalSemiAnnualPremium.toFixed(2),
    quarterlyPremium: totalQuarterlyPremium.toFixed(2),
    monthlyPremium: totalMonthlyPremium.toFixed(2)
  };
};

/**
 * Checks if the premium calculation should be triggered based on validation state
 * @param {Object} sectionValidation - The validation state of each section
 * @returns {boolean} - Whether the premium calculation should be triggered
 */
export const shouldTriggerCalculation = (sectionValidation) => {
  // Premium calculation should only be triggered when base coverage is valid
  return sectionValidation.base === true;
};

/**
 * Handles changes to coverage data and marks premium as outdated when appropriate
 * @param {Object} state - The Redux state containing coverage data
 * @param {Object} sectionValidation - The validation state of sections
 * @param {string} applicationNumber - The application number
 * @param {Function} dispatchFn - Redux dispatch function
 */
export const handleCoverageChange = (state, sectionValidation, applicationNumber, dispatchFn) => {
  // Only proceed if calculations should be marked as outdated based on validation state
  if (!shouldTriggerCalculation(sectionValidation)) {
    return;
  }

  // Instead of triggering calculation, mark the premium as outdated
  dispatchFn(markPremiumOutdated());
};

/**
 * Creates a premium calculation request that can be used with the useCalculatePremiumMutation hook
 * @param {Object} state - The state object containing coverage data 
 * @param {string} applicationNumber - The application number
 * @returns {Object} - Request data object ready for API call
 */
export const createPremiumRequest = (state, applicationNumber) => {
  return createPremiumCalcRequest(state, applicationNumber, false);
};

/**
 * 
 * // In component after a field changes and validation occurs:
 * useEffect(() => {
 *   
 *   handleCoverageChange(
 *     reduxState,
 *     sectionValidation,
 *     applicationNumber,
 *     dispatch // Pass dispatch instead of calculatePremium
 *   );
 * }, [productData, baseCoverageData, additionalCoverages, riders, sectionValidation]);
 */

export default handleCoverageChange; 