/**
 * Builds a Premium Calculation Request based on the coverage page data
 * This function formats the data according to the required structure for the premium calculation API
 */

/**
 * Validates if the coverage data is ready for premium calculation
 * @param {Object} productData - Product data from the coverage page
 * @param {Object} baseCoverageData - Base coverage data
 * @param {Array} additionalCoverages - Additional coverages array
 * @param {Array} riders - Riders array
 * @param {Array} owners - Coverage owners array
 * @returns {boolean} - Whether the data is valid for premium calculation
 */
const isDataValidForCalculation = (productData, baseCoverageData, additionalCoverages, riders, owners) => {
  // Check if product is selected
  if (!productData.planGUID) {
    return false;
  }

  // Check if base coverage has required fields
  if (!baseCoverageData.insured1 || 
      !baseCoverageData.faceAmount || 
      !baseCoverageData.underwritingClass) {
    return false;
  }

  // For joint coverage, insured2 must be present
  if (baseCoverageData.coverageType === 'joint' && !baseCoverageData.insured2) {
    return false;
  }

  // Check if additional coverages are valid
  const isAdditionalCoveragesValid = additionalCoverages.every(coverage => 
    coverage.insured1 && 
    coverage.faceAmount && 
    coverage.underwritingClass
  );

  if (!isAdditionalCoveragesValid && additionalCoverages.length > 0) {
    return false;
  }

  // Check if riders are valid
  const isRidersValid = riders.every(rider => 
    rider.type && 
    rider.selectedPerson
  );

  if (!isRidersValid && riders.length > 0) {
    return false;
  }

  return true;
};

/**
 * Maps an insured from the coverage owners array to the client object format
 * @param {Object} insured - The insured from the coverage owners array
 * @returns {Object} - Client object for the JSON request
 */
const mapClientFromInsured = (insured) => {
  return {
    ClientGUID: insured.clientGUID || `CLIENT-${insured.id}`,
    ClientName: `${insured.firstName} ${insured.lastName}`,
    CompanyName: null,
    Gender: insured.gender,
    Tobacco: insured.tobacco === 'Y' ? 'Smoker' : 'Non-Smoker',
    CountryCode: insured.countryCode || 'US',
    StateCode: insured.state,
    DateOfBirth: insured.dateOfBirth,
    TypeCode: insured.ownerType
  };
};

/**
 * Maps a coverage to the coverage object format for the JSON request
 * @param {Object} coverage - The coverage data
 * @param {string} type - The type of coverage (base or additional)
 * @param {number} index - The index for generating IDs
 * @param {Array} owners - The coverage owners array
 * @returns {Object} - Coverage object for the JSON request
 */
const mapCoverage = (coverage, type, index, owners) => {
  // Find the insured owners
  const insured1 = owners.find(owner => owner.id === coverage.insured1);
  const insured2 = coverage.insured2 ? owners.find(owner => owner.id === coverage.insured2) : null;
  
  const roles = [];
  
  // Check if we have stored insuredRoles from the backend
  if (coverage.insuredRoles && coverage.insuredRoles.length > 0) {
    // Use the actual role GUIDs returned from the backend
    coverage.insuredRoles.forEach(role => {
      const roleInsured = owners.find(owner => owner.id.toString() === role.insuredId.toString());
      if (roleInsured) {
        roles.push({
          RoleGUID: role.roleGUID,
          RoleCode: roleInsured.roleCode || role.roleCode || '01',
          client: mapClientFromInsured(roleInsured)
        });
      }
    });
  } else {
    // Fallback to generating roles if we don't have stored GUIDs
    if (insured1) {
      roles.push({
        RoleGUID: insured1.roleGUID || `ROLE-${insured1.id}`,
        RoleCode: insured1.roleCode || "01",
        client: mapClientFromInsured(insured1)
      });
    }
    
    if (insured2) {
      roles.push({
        RoleGUID: insured2.roleGUID || `ROLE-${insured2.id}`,
        RoleCode: insured2.roleCode || "01",
        client: mapClientFromInsured(insured2)
      });
    }
  }
  
  return {
    CoverageGUID: coverage.coverageGUID || `COV-${type}-${index}`,
    CoverageDefinitionGUID: coverage.coverageDefinitionGUID || `DEF-${type}-${index}`,
    coveragedetails: {
      FaceAmount: parseInt(coverage.faceAmount, 10),
      TableRating: parseInt(coverage.tableRating?.replace('%', '') || '100', 10),
      PermFlat: coverage.permanentFlatExtra ? parseInt(coverage.permanentFlatExtraAmount || '0', 10) : 0,
      TempFlat: coverage.temporaryFlatExtra ? parseInt(coverage.temporaryFlatExtraAmount || '0', 10) : 0,
      TempFlatDuration: coverage.temporaryFlatExtra ? parseInt(coverage.temporaryFlatExtraDuration || '0', 10) : 0,
      UWClass: coverage.underwritingClass
    },
    roles: roles
  };
};

/**
 * Builds a premium calculation request based on the coverage data
 * @param {Object} productData - Product data from the coverage page
 * @param {Object} baseCoverageData - Base coverage data
 * @param {Array} additionalCoverages - Additional coverages array
 * @param {Array} riders - Riders array
 * @param {Array} owners - Coverage owners array
 * @param {string} applicationNumber - The application number
 * @returns {Object|null} - The JSON request or null if data is invalid
 */
const buildPremiumCalcRequest = (productData, baseCoverageData, additionalCoverages, riders, owners, applicationNumber) => {
  // Validate data first
  if (!isDataValidForCalculation(productData, baseCoverageData, additionalCoverages, riders, owners)) {
    return null;
  }

  // Map the owner roles
  const ownerRoles = owners
    .filter(owner => owner.ownerType === '01') // Filter individual owners
    .map(owner => ({
      RoleGUID: owner.roleGUID || `ROLE-${owner.id}`, // Use actual roleGUID if available
      RoleCode: owner.roleCode || '01',
      client: mapClientFromInsured(owner)
    }));

  // Map base coverage
  const baseCoverage = mapCoverage(baseCoverageData, 'base', 1, owners);
  
  // Map additional coverages
  const mappedAdditionalCoverages = additionalCoverages.map((coverage, index) => 
    mapCoverage(coverage, 'additional', index + 1, owners)
  );
  
  // Combine all coverages
  const allCoverages = [baseCoverage, ...mappedAdditionalCoverages];
  
  // Build the full request
  const request = {
    application: {
      PlanGUID: productData.planGUID,
      ApplicationFormGUID: applicationNumber || 'APP-DEFAULT',
      roles: ownerRoles,
      coverages: allCoverages
    }
  };
  
  return request;
};

/**
 * Creates a premium calculation request if the data is valid
 * @param {Object} state - The Redux state with coverage data
 * @param {string} applicationNumber - The application number
 * @returns {Object|null} - The JSON request or null if data is invalid
 */
export const createPremiumCalcRequest = (state, applicationNumber) => {
  const productData = state.coverage.product;
  const baseCoverageData = state.coverage.base;
  const additionalCoverages = state.coverage.additional || [];
  const riders = state.coverage.riders || [];
  const owners = state.coverageOwners.owners || [];
  
  return buildPremiumCalcRequest(
    productData,
    baseCoverageData,
    additionalCoverages,
    riders,
    owners,
    applicationNumber
  );
};

export default createPremiumCalcRequest; 