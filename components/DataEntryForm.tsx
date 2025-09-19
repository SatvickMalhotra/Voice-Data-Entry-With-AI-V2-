import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import type { PolicyData } from '../types';
import { partnerData, nomineeRelationships } from '../constants';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { extractDataFromImage } from '../services/geminiService';
import { MicrophoneIcon, UploadIcon } from './Icons';

interface DataEntryFormProps {
  onSave: (policy: PolicyData) => void;
  onClose: () => void;
  initialData?: PolicyData | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const emptyForm: PolicyData = {
  id: '', partnerName: '', productDetails: '', premium: '', tenure: '', cseName: '',
  branchName: '', branchCode: '', region: '', customerName: '', gender: '',
  dateOfBirth: '', mobileNumber: '', customerId: '', enrolmentDate: '', savingsAcNo: '',
  csbCode: '', d2cCode: '', nomineeName: '', nomineeDob: '', nomineeRelationship: '',
  nomineeMobileNumber: '', nomineeGender: '', remarks: '',
};

// FIX: Removed apiKey and onApiKeyRequest props, as API key handling is moved to the service layer.
const DataEntryForm: React.FC<DataEntryFormProps> = ({ onSave, onClose, initialData, showToast }) => {
  const [formData, setFormData] = useState<PolicyData>(initialData || emptyForm);
  const [productOptions, setProductOptions] = useState<string[]>([]);
  const [premiumOptions, setPremiumOptions] = useState<{ Premium: number; Tenure: number; "CSE Name": string }[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeInput, setActiveInput] = useState<keyof PolicyData | null>(null);

  const handleSpeechResult = useCallback((result: string) => {
    if (activeInput) {
      setFormData(prev => ({ ...prev, [activeInput]: result }));
      setActiveInput(null);
    }
  }, [activeInput]);

  const { isListening, startListening, hasRecognitionSupport } = useSpeechRecognition(handleSpeechResult);

  const handleVoiceInput = (fieldName: keyof PolicyData) => {
    setActiveInput(fieldName);
    startListening();
  };

  useEffect(() => {
    setFormData(initialData || { ...emptyForm, id: Date.now().toString() });
  }, [initialData]);

  useEffect(() => {
    if (formData.partnerName && partnerData[formData.partnerName]) {
      setProductOptions(Object.keys(partnerData[formData.partnerName]));
    } else {
      setProductOptions([]);
    }
    setFormData(prev => ({ ...prev, productDetails: '', premium: '', tenure: '', cseName: '' }));
  }, [formData.partnerName]);

  useEffect(() => {
    if (formData.partnerName && formData.productDetails && partnerData[formData.partnerName]?.[formData.productDetails]) {
      setPremiumOptions(partnerData[formData.partnerName][formData.productDetails]);
    } else {
      setPremiumOptions([]);
    }
    setFormData(prev => ({ ...prev, premium: '', tenure: '', cseName: '' }));
  }, [formData.productDetails, formData.partnerName]);

  useEffect(() => {
    if (formData.premium) {
      const selectedPremium = premiumOptions.find(p => p.Premium === Number(formData.premium));
      if (selectedPremium) {
        setFormData(prev => ({
          ...prev,
          tenure: selectedPremium.Tenure,
          cseName: selectedPremium["CSE Name"],
        }));
      }
    }
  }, [formData.premium, premiumOptions]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as PolicyData['gender'] | PolicyData['nomineeGender'] }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAutofill = async () => {
    if (!imageFile) {
      showToast('Please upload an image first.', 'info');
      return;
    }
    // FIX: Removed API key check from the UI. The key is now handled in `geminiService`.
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        // FIX: Updated call to `extractDataFromImage` to reflect its new signature (no API key).
        const extractedData = await extractDataFromImage(base64String, imageFile.type);
        setFormData(prev => ({ ...prev, ...extractedData }));
        showToast('Data extracted successfully!', 'success');
      };
    } catch (error) {
        showToast(error instanceof Error ? error.message : 'An unknown error occurred.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const renderTextField = (name: keyof PolicyData, label: string, type = 'text', required = false) => (
    <div className="form-control">
      <label className="label"><span className="label-text">{label}</span></label>
      <div className="join w-full">
        <input type={type} name={name} value={formData[name] as string} onChange={handleChange} placeholder={label} className="input input-bordered join-item w-full" required={required} />
        {hasRecognitionSupport && (
          <button type="button" onClick={() => handleVoiceInput(name)} className={`btn join-item ${isListening && activeInput === name ? 'btn-error' : ''}`}><MicrophoneIcon className="w-5 h-5" /></button>
        )}
      </div>
    </div>
  );
  
  const renderRadioGroup = (name: keyof PolicyData, label: string, options: string[], required = false) => (
      <div className="form-control">
        <label className="label"><span className="label-text">{label}</span></label>
        <div className="flex gap-4">
          {options.map(opt => (
            <label key={opt} className="label cursor-pointer">
              <input type="radio" name={name} value={opt} checked={formData[name] === opt} onChange={handleRadioChange} className="radio checked:bg-primary" required={required} />
              <span className="label-text ml-2">{opt}</span>
            </label>
          ))}
        </div>
      </div>
  );

  return (
    <div className={`container mx-auto p-4 md:p-6 ${isFocusMode ? 'max-w-full' : ''}`}>
      <div className={`card bg-base-100 shadow-xl ${isFocusMode ? 'lg:grid lg:grid-cols-2 lg:gap-6' : ''}`}>
        {isFocusMode && imagePreview && (
          <figure className="p-4 rounded-xl max-h-[85vh] overflow-auto">
            <img src={imagePreview} alt="Document Preview" className="rounded-lg w-full" />
          </figure>
        )}
        <form onSubmit={handleSubmit} className="card-body">
            <h2 className="card-title text-2xl mb-4">{initialData ? 'Edit Policy' : 'Add New Policy'}</h2>
            
            {!isFocusMode && (
              <div className="bg-base-200 p-4 rounded-lg mb-6">
                <h3 className="font-bold text-lg mb-2">AI Autofill</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="file-input file-input-bordered w-full max-w-xs" />
                  <button type="button" onClick={handleAutofill} className="btn btn-secondary" disabled={!imageFile || isProcessing}>
                    {isProcessing && <span className="loading loading-spinner"></span>}
                    Autofill from Image
                  </button>
                  {imagePreview && (
                    <div className="flex items-center gap-2">
                        <img src={imagePreview} alt="preview" className="w-16 h-16 object-cover rounded-lg" />
                        <button type="button" onClick={() => setIsFocusMode(true)} className="btn btn-ghost">Focus Mode</button>
                    </div>
                  )}
                </div>
              </div>
            )}
             {isFocusMode && (
                <button type="button" onClick={() => setIsFocusMode(false)} className="btn btn-ghost absolute top-4 right-4">Exit Focus Mode</button>
             )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Policy Information */}
              <div className="form-control md:col-span-2 lg:col-span-3">
                <div className="divider">Policy Information</div>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Partner Name</span></label>
                <select name="partnerName" value={formData.partnerName} onChange={handleChange} className="select select-bordered" required>
                  <option value="">Select Partner</option>
                  {Object.keys(partnerData).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Product Details</span></label>
                <select name="productDetails" value={formData.productDetails} onChange={handleChange} className="select select-bordered" required disabled={!formData.partnerName}>
                  <option value="">Select Product</option>
                  {productOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Premium</span></label>
                <select name="premium" value={formData.premium} onChange={handleChange} className="select select-bordered" required disabled={!formData.productDetails}>
                  <option value="">Select Premium</option>
                  {premiumOptions.map(p => <option key={p.Premium} value={p.Premium}>{p.Premium}</option>)}
                </select>
              </div>
              {renderTextField('tenure', 'Tenure', 'number')}
              {renderTextField('cseName', 'CSE Name')}
              
              {/* Branch & Customer Information */}
              <div className="form-control md:col-span-2 lg:col-span-3">
                <div className="divider">Branch & Customer Information</div>
              </div>
              {renderTextField('branchName', 'Branch Name', 'text', true)}
              {renderTextField('branchCode', 'Branch Code', 'text', true)}
              {renderTextField('region', 'Region')}
              {renderTextField('customerName', 'Customer Name', 'text', true)}
              {renderRadioGroup('gender', 'Gender', ['Male', 'Female', 'Other'], true)}
              {renderTextField('dateOfBirth', 'Date of Birth', 'date', true)}
              {renderTextField('mobileNumber', 'Mobile Number', 'tel', true)}
              {renderTextField('customerId', 'Customer ID')}
              {renderTextField('enrolmentDate', 'Enrolment Date', 'date', true)}
              {renderTextField('savingsAcNo', 'Savings A/C No.')}
              {renderTextField('csbCode', 'CSB Code')}
              {renderTextField('d2cCode', 'D2C Code / RO Code')}

              {/* Nominee Details */}
              <div className="form-control md:col-span-2 lg:col-span-3">
                <div className="divider">Nominee Details</div>
              </div>
              {renderTextField('nomineeName', 'Nominee Name', 'text', true)}
              {renderTextField('nomineeDob', 'Nominee Date of Birth', 'date')}
              <div className="form-control">
                <label className="label"><span className="label-text">Nominee Relationship</span></label>
                <select name="nomineeRelationship" value={formData.nomineeRelationship} onChange={handleChange} className="select select-bordered" required>
                  <option value="">Select Relationship</option>
                  {nomineeRelationships.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {renderTextField('nomineeMobileNumber', 'Nominee Mobile Number', 'tel')}
              {renderRadioGroup('nomineeGender', 'Nominee Gender', ['Male', 'Female', 'Other'])}

              {/* Remarks */}
               <div className="form-control md:col-span-2 lg:col-span-3">
                 <div className="divider">Remarks</div>
                 <textarea name="remarks" value={formData.remarks} onChange={handleChange} className="textarea textarea-bordered h-24" placeholder="Any additional remarks..."></textarea>
               </div>
            </div>

            <div className="card-actions justify-end mt-6">
              <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
              <button type="submit" className="btn btn-primary">{initialData ? 'Update Entry' : 'Save Entry'}</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default DataEntryForm;