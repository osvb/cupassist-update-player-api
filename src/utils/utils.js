/**
 * @param {string} cupassistGenderString 
 * @returns {string} "MALE" or "FEMALE"
 */
export function translateCupassistGenderToGraphQLEnum(cupassistGenderString) {
  return gender === "K" ? "FEMALE" : "MALE";
}
