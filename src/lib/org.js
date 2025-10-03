/**
 * Organization state management via localStorage
 */

export function getOrgId() {
  return localStorage.getItem("orgId");
}

export function getOrgName() {
  return localStorage.getItem("orgName");
}

export function setOrg(orgId, orgName) {
  localStorage.setItem("orgId", orgId);
  localStorage.setItem("orgName", orgName);
}

export function clearOrg() {
  localStorage.removeItem("orgId");
  localStorage.removeItem("orgName");
}

export function hasOrg() {
  return !!localStorage.getItem("orgId");
}

