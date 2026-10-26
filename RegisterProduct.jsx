import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../api';
import toast from 'react-hot-toast';
import { MdSave, MdArrowBack, MdInfo } from 'react-icons/md';

const CATEGORIES = ['Smartphone', 'Laptop', 'Tablet', 'Desktop', 'TV', 'Appliance', 'Camera', 'Audio', 'Gaming', 'Wearable', 'Other'];

const initialForm = {
  name: '',
  brand: '',
  model: '',
  serialNumber: '',
  category: '',
  purchaseDate: '',
  warrantyExpiry: '',
  description: '',
};

export default function RegisterProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Product name is required';
    if (!form.brand.trim()) newErrors.brand = 'Brand is required';
    if (!form.model.trim()) newErrors.model = 'Model is required';
    if (!form.serialNumber.trim()) newErrors.serialNumber = 'Serial number is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
    if (!form.warrantyExpiry) newErrors.warrantyExpiry = 'Warranty expiry date is required';
    if (form.purchaseDate && form.warrantyExpiry && form.warrantyExpiry <= form.purchaseDate) {
      newErrors.warrantyExpiry = 'Warranty expiry must be after purchase date';
    }
    return newErrors;
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
      const res = await createProduct(form);
      toast.success('Product registered successfully!');
      navigate(`/products/${res.data.data._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to register product';
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

  const Field = ({ label, name, type = 'text', required = true, children, hint }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children || (
        <input
          type={type}
          id={name}
          name={name}
          value={form[name]}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
            errors[name] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
          }`}
        />
      )}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      {errors[name] && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><MdInfo className="flex-shrink-0" />{errors[name]}</p>}
    </div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 fade-in-up">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
        >
          <MdArrowBack className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-outfit">Register Product</h1>
          <p className="text-slate-500 mt-0.5">Add a new product to the passport system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl fade-in-up">
        {/* Basic Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-5">
          <h2 className="text-lg font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100 font-outfit">
            Product Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Product Name" name="name" />
            <Field label="Brand" name="brand" />
            <Field label="Model" name="model" />
            <Field label="Serial Number" name="serialNumber" hint="Must be unique. Will be stored in uppercase." />
            <Field label="Category" name="category" required>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white appearance-none cursor-pointer ${
                  errors.category ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><MdInfo className="flex-shrink-0" />{errors.category}</p>}
            </Field>
          </div>
        </div>

        {/* Dates Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-5">
          <h2 className="text-lg font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100 font-outfit">
            Purchase & Warranty
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Purchase Date" name="purchaseDate" type="date" />
            <Field label="Warranty Expiry Date" name="warrantyExpiry" type="date" />
          </div>
        </div>

        {/* Description Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100 font-outfit">
            Description <span className="text-slate-400 font-normal text-sm">(Optional)</span>
          </h2>
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Product Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              maxLength={1000}
              placeholder="Describe the product, configuration, notes..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
            />
            <p className="text-xs text-slate-400 text-right mt-1">{form.description.length}/1000</p>
          </div>
        </div>

        {/* Info notice */}
        <div className="flex gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
          <MdInfo className="text-blue-500 text-xl flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            A QR code and digital passport will be automatically generated for this product after registration.
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-all hover:scale-105 shadow-lg shadow-teal-500/25"
            style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)' }}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <MdSave className="text-xl" />
                Register Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
