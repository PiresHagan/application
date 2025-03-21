import createPremiumCalcRequest from './buildPremiumCalcRequest';

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
 * Handles changes to coverage data and triggers premium calculation when appropriate
 * @param {Object} state - The Redux state containing coverage data
 * @param {Object} sectionValidation - The validation state of sections
 * @param {string} applicationNumber - The application number
 * @param {Function} calculatePremiumCallback - Callback function to execute the premium calculation
 */
export const handleCoverageChange = (state, sectionValidation, applicationNumber, calculatePremiumCallback) => {
  // Only proceed if calculations should be triggered based on validation state
  if (!shouldTriggerCalculation(sectionValidation)) {
    return;
  }

  // Create the premium calculation request
  const calcRequest = createPremiumCalcRequest(state, applicationNumber);
  
  // If the request is valid, trigger calculation
  if (calcRequest) {
    calculatePremiumCallback(calcRequest);
  }
};

/**
 * 
 * // In component after a field changes and validation occurs:
 * useEffect(() => {
 *   // After field changes and validation completes
 *   handleCoverageChange(
 *     reduxState,
 *     sectionValidation,
 *     applicationNumber,
 *     (requestData) => dispatch(calculatePremium(requestData))
 *   );
 * }, [productData, baseCoverageData, additionalCoverages, riders, sectionValidation]);
 */

export default handleCoverageChange; 