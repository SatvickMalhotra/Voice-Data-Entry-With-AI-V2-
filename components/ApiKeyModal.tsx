import React, { useState, useRef, useEffect } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [key, setKey] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleSave = () => {
    if (key.trim()) {
      onSave(key.trim());
      onClose();
    }
  };

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Enter Gemini API Key</h3>
        <p className="py-4">To use the AI Autofill feature, please provide your Google Gemini API key. This key will be stored in your browser's session storage.</p>
        <input
          type="password"
          placeholder="Your API Key"
          className="input input-bordered w-full"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!key.trim()}>Save Key</button>
        </div>
      </div>
       <form method="dialog" className="modal-backdrop">
          <button onClick={onClose}>close</button>
        </form>
    </dialog>
  );
};

export default ApiKeyModal;
