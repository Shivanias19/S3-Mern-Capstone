import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { addRepair } from '../api';
import toast from 'react-hot-toast';
import { MdSave, MdArrowBack, MdInfo, MdAdd, MdClose } from 'react-icons/md';

const SERVICE_STATUSES = [
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
];

const initialForm = {
  repairDate: new Date().toISOString().split('T')[0],
  problemDescription: '',
  repairAction: '',
  replacedParts: [],
  repairCost: '',
  technicianName: '',
  serviceStatus: 'completed',
};

export default function AddRepair() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [partInput, setPartInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const addPart = () => {
    const trimmed = partInput.trim();
    if (!trimmed) return;
    setForm((prev) => ({ ...prev, replacedParts: [...prev.replacedParts, trimmed] }));
    setPartInput('');
  };

  const removePart = (idx) => {
    setForm((prev) => ({ ...prev, replacedParts: prev.replacedParts.filter((_, i) => i !== idx) }));
  };

  const validate = () => {
    const e = {};
    if (!form.repairDate) e.repairDate = 'Repair date is required';
    if (!form.problemDescription.trim()) e.problemDescription = 'Problem description is required';
    if (!form.repairAction.trim()) e.repairAction = 'Repair action is required';
    if (form.repairCost === '' || isNaN(parseFloat(form.repairCost))) e.repairCost = 'Repair cost is required';
    if (parseFloat(form.repairCost) < 0) e.repairCost = 'Cost cannot be negative';
    if (!form.technicianName.trim()) e.technicianName = 'Technician name is required';
    if (!form.serviceStatus) e.serviceStatus = 'Service status is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the validation errors');
      return;
    }

    setSubmitting(true);
    try {
      await addRepair(id, {
        ...form,
        repairCost: parseFloat(form.repairCost),
      });
      toast.success('Repair record added successfully!');
      navigate(`/products/${id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add repair record';
      toast.error(msg);
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach(({ param, msg }) => {
          fieldErrors[param] = msg;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const FieldError = ({ name }) =>
    errors[name] ? (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
        <MdInfo className="flex-shrink-0" /> {errors[name]}
      </p>
    ) : null;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 fade-in-up">
        <Link
          to={`/products/${id}`}
          className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
        >
          <MdArrowBack className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-outfit">Add Repair Record</h1>
          <p className="text-slate-500 mt-0.5">Log a new service entry for this product</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        {/* Repair Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-5 fade-in-up">
          <h2 className="text-lg font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100 font-outfit">
            Repair Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Repair date */}
            <div>
              <label htmlFor="repairDate" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Repair Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                id="repairDate"
                name="repairDate"
                value={form.repairDate}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.repairDate ? 'border-red-300' : 'border-slate-200'}`}
              />
              <FieldError name="repairDate" />
            </div>

            {/* Technician */}
            <div>
              <label htmlFor="technicianName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Technician Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="technicianName"
                name="technicianName"
                value={form.technicianName}
                onChange={handleChange}
                placeholder="e.g. John Smith"
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.technicianName ? 'border-red-300' : 'border-slate-200'}`}
              />
              <FieldError name="technicianName" />
            </div>

            {/* Cost */}
            <div>
              <label htmlFor="repairCost" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Repair Cost ($) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  id="repairCost"
                  name="repairCost"
                  value={form.repairCost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full pl-7 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.repairCost ? 'border-red-300' : 'border-slate-200'}`}
                />
              </div>
              <FieldError name="repairCost" />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="serviceStatus" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Service Status <span className="text-red-400">*</span>
              </label>
              <select
                id="serviceStatus"
                name="serviceStatus"
                value={form.serviceStatus}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {SERVICE_STATUSES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Problem description */}
          <div className="mt-5">
            <label htmlFor="problemDescription" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Problem Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="problemDescription"
              name="problemDescription"
              value={form.problemDescription}
              onChange={handleChange}
              rows={3}
              maxLength={1000}
              placeholder="Describe the issue reported by the user..."
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${errors.problemDescription ? 'border-red-300' : 'border-slate-200'}`}
            />
            <FieldError name="problemDescription" />
          </div>

          {/* Repair action */}
          <div className="mt-5">
            <label htmlFor="repairAction" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Repair Action Taken <span className="text-red-400">*</span>
            </label>
            <textarea
              id="repairAction"
              name="repairAction"
              value={form.repairAction}
              onChange={handleChange}
              rows={3}
              maxLength={1000}
              placeholder="Describe what was done to fix the problem..."
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${errors.repairAction ? 'border-red-300' : 'border-slate-200'}`}
            />
            <FieldError name="repairAction" />
          </div>
        </div>

        {/* Replaced Parts */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-5 fade-in-up">
          <h2 className="text-lg font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100 font-outfit">
            Replaced Parts <span className="text-slate-400 font-normal text-sm">(Optional)</span>
          </h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={partInput}
              onChange={(e) => setPartInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPart(); } }}
              placeholder="Type a part name and press Enter or Add"
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="button"
              onClick={addPart}
              className="flex items-center gap-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              <MdAdd /> Add
            </button>
          </div>
          {form.replacedParts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.replacedParts.map((part, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm px-3 py-1.5 rounded-full border border-blue-100">
                  {part}
                  <button type="button" onClick={() => removePart(i)} className="text-blue-400 hover:text-blue-700">
                    <MdClose className="text-sm" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Audit notice */}
        <div className="flex gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100 mb-6">
          <MdInfo className="text-purple-500 text-xl flex-shrink-0 mt-0.5" />
          <p className="text-sm text-purple-700">
            This record will be added to a tamper-evident SHA-256 hash chain.
            The record cannot be deleted or modified without breaking the chain integrity.
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Link
            to={`/products/${id}`}
            className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-all hover:scale-105 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #1530ab, #2a5cff)' }}
          >
            {submitting ? (
              <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving...</>
            ) : (
              <><MdSave className="text-xl" /> Save Repair Record</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
