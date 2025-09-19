export interface PolicyData {
  id: string;
  partnerName: string;
  productDetails: string;
  premium: number | '';
  tenure: number | '';
  cseName: string;
  branchName: string;
  branchCode: string;
  region: string;
  customerName: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  dateOfBirth: string;
  mobileNumber: string;
  customerId: string;
  enrolmentDate: string;
  savingsAcNo: string;
  csbCode: string;
  d2cCode: string;
  nomineeName: string;
  nomineeDob: string;
  nomineeRelationship: string;
  nomineeMobileNumber: string;
  nomineeGender: 'Male' | 'Female' | 'Other' | '';
  remarks: string;
}

export type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};
