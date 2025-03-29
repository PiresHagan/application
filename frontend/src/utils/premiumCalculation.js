import createPremiumCalcRequest from './buildPremiumCalcRequest';
import { markPremiumOutdated } from '../slices/premiumSlice';

/**
 * @param {Object} calculationResult 
 * @returns {Object} 
 */
export const formatPremiumResult = (calculationResult) => {
  const appGuid = Object.keys(calculationResult).find(key => 
    key.includes('_totalAnnualPremium')
  )?.split('_totalAnnualPremium')[0] || '';

  const totalAnnualPremium = calculationResult[`${appGuid}_totalAnnualPremium`] || 0;
  const totalMonthlyPremium = calculationResult[`${appGuid}_totalMonthlyPremium`] || 0;
  const totalQuarterlyPremium = calculationResult[`${appGuid}_totalQuarterlyPremium`] || 0;
  const totalSemiAnnualPremium = calculationResult[`${appGuid}_totalSemiAnnualPremium`] || 0;

  const allPremiums = Object.entries(calculationResult)
    .filter(([key]) => key.endsWith('_premium') && !key.includes(appGuid))
    .map(([_, value]) => value);

  const basePremium = allPremiums[0] || 0;
  const additionalPremiums = allPremiums.slice(1);

  return {
    totalPremium: totalAnnualPremium.toFixed(2),
    basePremium: basePremium.toFixed(2),
    additionalPremiums: additionalPremiums.map(p => p.toFixed(2)),
    riderPremiums: [],
    calculationDate: new Date().toISOString(),
    frequency: 'Annual',
    annualPremium: totalAnnualPremium.toFixed(2),
    semiAnnualPremium: totalSemiAnnualPremium.toFixed(2),
    quarterlyPremium: totalQuarterlyPremium.toFixed(2),
    monthlyPremium: totalMonthlyPremium.toFixed(2)
  };
};

/**
 * @param {Object} sectionValidation - The validation state of each section
 * @param {Object} state - The Redux state containing coverage data
 * @returns {boolean} - Whether the premium calculation should be triggered
 */
export const shouldTriggerCalculation = (sectionValidation, state) => {
  // Check if base section is valid 
  if (sectionValidation.base !== true) {
    return false;
  }
  
  // Check if face amount is within valid range
  const baseCoverage = state?.coverage?.base;
  if (!baseCoverage || !baseCoverage.faceAmount) {
    return false;
  }
  
  const faceAmount = Number(baseCoverage.faceAmount);
  if (faceAmount < 10000 || faceAmount > 5000000) {
    return false;
  }
  
  // Check additional coverages if they exist
  const additionalCoverages = state?.coverage?.additional || [];
  for (const coverage of additionalCoverages) {
    if (coverage.faceAmount) {
      const additionalFaceAmount = Number(coverage.faceAmount);
      if (additionalFaceAmount < 10000 || additionalFaceAmount > 5000000) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * @param {Object} state - The Redux state containing coverage data
 * @param {Object} sectionValidation - The validation state of sections
 * @param {string} applicationNumber - The application number
 * @param {Function} dispatchFn - Redux dispatch function
 */
export const handleCoverageChange = (state, sectionValidation, applicationNumber, dispatchFn) => {
  if (!shouldTriggerCalculation(sectionValidation, state)) {
    return;
  }

  dispatchFn(markPremiumOutdated());
};

/**
 * @param {Object} state - The state object containing coverage data 
 * @param {string} applicationNumber - The application number
 * @returns {Object} - Request data object ready for API call
 */
export const createPremiumRequest = (state, applicationNumber) => {
  return createPremiumCalcRequest(state, applicationNumber, false);
};

/**
 * 
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