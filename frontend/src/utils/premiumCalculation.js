import createPremiumCalcRequest from './buildPremiumCalcRequest';
import { markPremiumOutdated } from '../slices/premiumSlice';

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