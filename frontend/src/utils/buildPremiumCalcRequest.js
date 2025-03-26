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
  
  if (coverage.insuredRoles && coverage.insuredRoles.length > 0) {
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
  if (!isDataValidForCalculation(productData, baseCoverageData, additionalCoverages, riders, owners)) {
    return null;
  }

  const ownerRoles = owners
    .filter(owner => owner.ownerType === '01')
    .map(owner => ({
      RoleGUID: owner.roleGUID || `ROLE-${owner.id}`,
      RoleCode: owner.roleCode || '01',
      client: mapClientFromInsured(owner)
    }));

  const baseCoverage = mapCoverage(baseCoverageData, 'base', 1, owners);
  
  const mappedAdditionalCoverages = additionalCoverages.map((coverage, index) => 
    mapCoverage(coverage, 'additional', index + 1, owners)
  );
  
  const allCoverages = [baseCoverage, ...mappedAdditionalCoverages];
  
  const request = {
    application: {
      PlanGUID: productData.planGUID,
      ApplicationFormGUID: applicationNumber || 'APP-000000',
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
 * @param {boolean} forceInitialCalculation - Whether to force initial calculation
 * @returns {Object|null} - The JSON request or null if data is invalid
 */
export const createPremiumCalcRequest = (state, applicationNumber, forceInitialCalculation = false) => {
  const productData = state.coverage.product;
  const baseCoverageData = state.coverage.base;
  const additionalCoverages = state.coverage.additional || [];
  const riders = state.coverage.riders || [];
  const owners = state.coverageOwners.owners || [];
  
  // If forceInitialCalculation is true, we'll create a basic valid request even if data isn't perfect
  if (forceInitialCalculation) {
    // Create a minimal valid request with default values where needed
    const enhancedProductData = {
      ...productData,
      planGUID: productData.planGUID || 'DEFAULT-PLAN-GUID'
    };
    
    const enhancedBaseCoverageData = {
      ...baseCoverageData,
      faceAmount: baseCoverageData.faceAmount || '100000',
      insured1: baseCoverageData.insured1 || '1',
      underwritingClass: baseCoverageData.underwritingClass || 'Standard'
    };
    
    return buildPremiumCalcRequest(
      enhancedProductData,
      enhancedBaseCoverageData,
      additionalCoverages,
      riders,
      owners,
      applicationNumber
    );
  }

  console.log('baseCoverageData', baseCoverageData);
  
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