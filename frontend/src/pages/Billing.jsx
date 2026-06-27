import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiCreditCard,
  FiSmartphone,
  FiBriefcase,
  FiBookOpen,
  FiCheckCircle,
  FiLock,
  FiArrowRight,
  FiAlertCircle,
  FiDownload,
  FiPrinter,
  FiMail,
  FiGlobe,
  FiX,
  FiCheck,
} from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../services/api';

// Indian number formatter
const formatINR = (num) =>
  new Intl.NumberFormat('en-IN').format(Math.round(num));



const Billing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  // Get plan details passed from state, or fallback to default
  const { planName = 'Pro Planner', price = 999, isYearly = false } = location.state || {};

  // Form states - prefill if user is logged in
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phoneNo || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phoneNo || '',
      });
      setWalletPhone(user.phoneNo || '');
    }
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');

  // Enhanced payment simulation states
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  // Stripe modal simulation states
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeStep, setStripeStep] = useState('input'); // input, processing, verifying, success
  const [stripeCard, setStripeCard] = useState({ number: '4242 4242 4242 4242', expiry: '12/28', cvc: '242', zip: '400001' });
  const [stripeErrors, setStripeErrors] = useState({});

  // UPI simulation states
  const [upiRef, setUpiRef] = useState('');
  const [isUpiVerifying, setIsUpiVerifying] = useState(false);
  const [upiStep, setUpiStep] = useState('idle'); // idle, verifying, success
  const [copied, setCopied] = useState(false);

  // Netbanking simulation states
  const [isNetbankingVerifying, setIsNetbankingVerifying] = useState(false);
  const [netbankingStep, setNetbankingStep] = useState('idle'); // idle, verifying, success

  // Wallet simulation states
  const [isWalletVerifying, setIsWalletVerifying] = useState(false);
  const [walletStep, setWalletStep] = useState('idle'); // idle, verifying, success
  const [walletPhone, setWalletPhone] = useState(user?.phoneNo || '');

  // Email invoice state
  const [isEmailing, setIsEmailing] = useState(false);

  // Prices calculation
  const basePrice = price;
  const gst = basePrice * 0.18;
  const totalAmount = basePrice + gst;

  // Handle inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'number') {
      formattedValue = value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    } else if (name === 'expiry') {
      formattedValue = value.replace(/\//g, '').replace(/(\d{2})/g, '$1/').trim().slice(0, 5);
      if (formattedValue.endsWith('/')) {
        formattedValue = formattedValue.slice(0, -1);
      }
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }
    setCardDetails((prev) => ({ ...prev, [name]: formattedValue }));
  };

  // Form validation for basic contact details
  const validateBasicInfo = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Enter a valid 10-digit phone number';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Copy UPI ID
  const handleCopyUpiId = () => {
    navigator.clipboard.writeText('payments@weddingplatform');
    setCopied(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Create Invoice on Backend
  const handleCreateInvoice = async (method, transactionId) => {
    const invoiceNum = 'INV-' + Math.floor(1000000000 + Math.random() * 9000000000);
    try {
      const response = await api.post('/invoices', {
        invoiceNumber: invoiceNum,
        userName: formData.name,
        userEmail: formData.email,
        userPhone: formData.phone,
        planName: planName,
        amountPaid: basePrice,
        gst: gst,
        totalAmount: totalAmount,
        paymentMethod: method,
        isYearly: isYearly,
        transactionId: transactionId
      });

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Invoice generation failed');
      }

      setGeneratedInvoice(response.data.data);
      setPaymentSuccess(true);
      
      // If user was already logged in, refresh context to reflect new plan status
      if (user) {
        await refreshUser();
      }
      return response.data.data;
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to sync transaction with server");
      throw err;
    }
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateBasicInfo()) return;

    if (paymentMethod === 'card') {
      // Open Stripe Checkout Modal
      setShowStripeModal(true);
      setStripeStep('input');
    } else if (paymentMethod === 'upi') {
      // Validate UTR input
      if (!upiRef.trim() || upiRef.length < 8) {
        setFormErrors(prev => ({ ...prev, upiRef: 'Enter a valid UPI Reference / UTR Number' }));
        return;
      }
      // Start UPI payment verification flow
      handleUpiVerification();
    } else if (paymentMethod === 'netbanking') {
      if (!selectedBank) {
        toast.error("Please select a bank to proceed with Netbanking.");
        return;
      }
      handleNetbankingPayment();
    } else if (paymentMethod === 'wallet') {
      if (!selectedWallet) {
        toast.error("Please select a wallet to proceed.");
        return;
      }
      handleWalletPayment();
    } else {
      toast.error("Please select a valid payment method.");
    }
  };

  // Stripe Card Payment Simulation
  const handleStripePayment = async () => {
    // Basic validation of stripe card fields
    const errors = {};
    if (!stripeCard.number || stripeCard.number.length < 19) errors.number = 'Enter a valid card number';
    if (!stripeCard.expiry || stripeCard.expiry.length < 5) errors.expiry = 'Enter expiry (MM/YY)';
    if (!stripeCard.cvc || stripeCard.cvc.length < 3) errors.cvc = 'CVC is required';
    if (!stripeCard.zip || stripeCard.zip.length < 5) errors.zip = 'ZIP code required';

    if (Object.keys(errors).length > 0) {
      setStripeErrors(errors);
      return;
    }

    setStripeErrors({});
    setStripeStep('processing'); // "Processing Payment..."

    setTimeout(() => {
      setStripeStep('verifying'); // "Verifying Transaction..."
      
      setTimeout(async () => {
        setStripeStep('success'); // "Payment Successful"
        
        try {
          const simulatedTxId = 'ch_' + Math.random().toString(36).substring(2, 16);
          await handleCreateInvoice('Stripe Card', simulatedTxId);
          toast.success("Payment completed successfully!");
          
          setTimeout(() => {
            setShowStripeModal(false);
          }, 1500);
        } catch (e) {
          setStripeStep('input');
        }
      }, 1500);
    }, 1500);
  };

  // UPI Payment Verification Simulation
  const handleUpiVerification = () => {
    setIsUpiVerifying(true);
    setUpiStep('verifying');

    setTimeout(async () => {
      try {
        await handleCreateInvoice('UPI QR Code', upiRef);
        setUpiStep('success');
        toast.success("UPI payment verified successfully!");
      } catch (err) {
        setUpiStep('idle');
      } finally {
        setIsUpiVerifying(false);
      }
    }, 2500);
  };

  // Netbanking Payment Simulation
  const handleNetbankingPayment = () => {
    setIsNetbankingVerifying(true);
    setNetbankingStep('verifying');
    const toastId = toast.loading(`Connecting to secure ${selectedBank} bank server...`);

    setTimeout(async () => {
      try {
        const simulatedTxId = 'nb_' + Math.random().toString(36).substring(2, 16);
        await handleCreateInvoice('Netbanking (' + selectedBank + ')', simulatedTxId);
        setNetbankingStep('success');
        toast.success("Netbanking transaction approved successfully!", { id: toastId });
      } catch (err) {
        setNetbankingStep('idle');
        toast.error("Netbanking authorization failed.", { id: toastId });
      } finally {
        setIsNetbankingVerifying(false);
      }
    }, 2500);
  };

  // Wallet Payment Simulation
  const handleWalletPayment = () => {
    setIsWalletVerifying(true);
    setWalletStep('verifying');
    const toastId = toast.loading(`Sending transaction request to ${selectedWallet}...`);

    setTimeout(async () => {
      try {
        const simulatedTxId = 'wl_' + Math.random().toString(36).substring(2, 16);
        await handleCreateInvoice('Wallet (' + selectedWallet + ')', simulatedTxId);
        setWalletStep('success');
        toast.success("Wallet transaction approved successfully!", { id: toastId });
      } catch (err) {
        setWalletStep('idle');
        toast.error("Wallet transaction failed.", { id: toastId });
      } finally {
        setIsWalletVerifying(false);
      }
    }, 2500);
  };

  // Simulate Invoice Emailing
  const handleEmailInvoice = () => {
    setIsEmailing(true);
    toast.loading("Preparing branded receipt email...", { id: "email-toast" });

    setTimeout(() => {
      toast.success(`Invoice sent to ${formData.email} successfully!`, { id: "email-toast" });
      setIsEmailing(false);
    }, 1800);
  };

  // Printable layout window open
  const handleDownloadInvoice = () => {
    const inv = generatedInvoice || {
      invoiceNumber: 'INV-TEMP',
      userName: formData.name,
      userEmail: formData.email,
      userPhone: formData.phone,
      planName: planName,
      amountPaid: basePrice,
      gst: gst,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      transactionId: 'TXN-DEMO',
      createdAt: new Date()
    };
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${inv.invoiceNumber}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #4A403A; line-height: 1.5; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); font-size: 16px; color: #555; border-radius: 12px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #C9A27E; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 26px; font-weight: bold; color: #C9A27E; font-family: Georgia, serif; }
            .title { font-size: 28px; font-weight: bold; text-align: right; color: #4A403A; }
            .details-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
            .details-block h4 { margin: 0 0 8px 0; color: #C9A27E; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
            .details-block p { margin: 0 0 5px 0; font-size: 14px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .table th { background: #FAF7F2; color: #4A403A; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
            .table th, .table td { border: 1px solid #eee; padding: 12px; text-align: left; }
            .table td { font-size: 14px; }
            .totals { float: right; width: 300px; margin-top: 20px; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
            .totals-row.grand-total { border-top: 2px double #C9A27E; font-size: 18px; font-weight: bold; color: #C9A27E; padding-top: 12px; }
            .footer { text-align: center; margin-top: 80px; font-size: 11px; opacity: 0.6; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div>
                <div class="logo">EvenAfter</div>
                <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Premium Wedding Planner & Vendor Network</p>
              </div>
              <div class="title">INVOICE</div>
            </div>
            
            <div class="details-grid">
              <div class="details-block">
                <h4>Invoice Info</h4>
                <p><strong>Invoice No:</strong> ${inv.invoiceNumber}</p>
                <p><strong>Date & Time:</strong> ${new Date(inv.createdAt).toLocaleString()}</p>
                <p><strong>Transaction ID:</strong> ${inv.transactionId || 'N/A'}</p>
                <p><strong>Payment Status:</strong> <span style="color: #10B981; font-weight: bold;">PAID</span></p>
              </div>
              <div class="details-block" style="text-align: right;">
                <h4>Billed To</h4>
                <p><strong>Name:</strong> ${inv.userName}</p>
                <p><strong>Phone:</strong> ${inv.userPhone}</p>
                <p><strong>Email:</strong> ${inv.userEmail}</p>
              </div>
            </div>
            
            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Payment Method</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${inv.planName} Subscription Plan Activation</td>
                  <td>${inv.paymentMethod.toUpperCase()}</td>
                  <td style="text-align: right;">₹${new Intl.NumberFormat('en-IN').format(inv.amountPaid)}</td>
                </tr>
              </tbody>
            </table>
            
            <div style="width: 100%; overflow: hidden;">
              <div class="totals">
                <div class="totals-row">
                  <span>Subtotal</span>
                  <span>₹${new Intl.NumberFormat('en-IN').format(inv.amountPaid)}</span>
                </div>
                <div class="totals-row">
                  <span>GST (18%)</span>
                  <span>₹${new Intl.NumberFormat('en-IN').format(inv.gst)}</span>
                </div>
                <div class="totals-row grand-total">
                  <span>Grand Total</span>
                  <span>₹${new Intl.NumberFormat('en-IN').format(inv.totalAmount)}</span>
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p>This is a computer generated invoice and does not require a physical signature.</p>
              <p>For any billing support, please reach out to support@evenafter.com</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Generate redirection link for guest checkout
  const getRegisterLink = () => {
    const params = new URLSearchParams({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      plan: planName,
    });
    return `/register?${params.toString()}`;
  };

  const handleDashboardRedirect = () => {
    if (user?.role === 'planner') {
      navigate('/planner');
    } else if (user?.role === 'vendor') {
      navigate('/vendor');
    } else if (user?.role === 'superadmin') {
      navigate('/admin');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="bg-ivory dark:bg-darkbg text-darktext dark:text-gray-300 font-roboto min-h-screen transition-colors duration-300 relative">
      <Navbar />

      {/* Embedded CSS for QR Laser scanner animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan-radar {
          0% { top: 0%; opacity: 0.3; }
          50% { top: 100%; opacity: 0.8; }
          100% { top: 0%; opacity: 0.3; }
        }
        .laser-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #c9a27e, #dfb893, #c9a27e, transparent);
          box-shadow: 0 0 10px #c9a27e, 0 0 20px #dfb893;
          animation: scan-radar 3s ease-in-out infinite;
        }
      `}} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 text-sm font-semibold text-rosegold hover:text-rosegold/80 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Plans
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {!paymentSuccess ? (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Column: Form and Payments (8 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="luxury-card rounded-3xl border border-rosegold/20 dark:border-goldAccent/15 p-6 sm:p-8">
                  <h1 className="font-playfair text-2xl sm:text-3xl font-bold mb-6">
                    Billing Details
                  </h1>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider opacity-60 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border bg-cream/20 dark:bg-darkcard/40 focus:outline-none focus:ring-1 focus:ring-rosegold dark:focus:ring-goldAccent transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                            formErrors.name
                              ? 'border-red-500'
                              : 'border-rosegold/30 dark:border-goldAccent/25'
                          }`}
                          placeholder="E.g., Priya Sharma"
                        />
                        {formErrors.name && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <FiAlertCircle /> {formErrors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider opacity-60 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border bg-cream/20 dark:bg-darkcard/40 focus:outline-none focus:ring-1 focus:ring-rosegold dark:focus:ring-goldAccent transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                            formErrors.email
                              ? 'border-red-500'
                              : 'border-rosegold/30 dark:border-goldAccent/25'
                          }`}
                          placeholder="priya@example.com"
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <FiAlertCircle /> {formErrors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider opacity-60 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border bg-cream/20 dark:bg-darkcard/40 focus:outline-none focus:ring-1 focus:ring-rosegold dark:focus:ring-goldAccent transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                            formErrors.phone
                              ? 'border-red-500'
                              : 'border-rosegold/30 dark:border-goldAccent/25'
                          }`}
                          placeholder="9876543210"
                        />
                        {formErrors.phone && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <FiAlertCircle /> {formErrors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="w-full h-px bg-rosegold/15 dark:bg-goldAccent/15 my-6" />

                    {/* Payment Method Selector */}
                    <div>
                      <h2 className="font-playfair text-xl font-bold mb-4">
                        Select Payment Method
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[
                          { id: 'card', label: 'Credit Card / Stripe', icon: FiCreditCard },
                          { id: 'upi', label: 'UPI / Scan QR Code', icon: FiSmartphone },
                          { id: 'netbanking', label: 'Netbanking', icon: FiGlobe },
                          { id: 'wallet', label: 'Mobile Wallets', icon: FiBriefcase },
                        ].map((method) => {
                          const Icon = method.icon;
                          const active = paymentMethod === method.id;
                          return (
                            <button
                              type="button"
                              key={method.id}
                              onClick={() => {
                                setPaymentMethod(method.id);
                                setFormErrors({});
                              }}
                              className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all duration-300 cursor-pointer ${
                                active
                                  ? 'border-rosegold dark:border-goldAccent bg-rosegold/5 dark:bg-goldAccent/5 font-semibold text-rosegold dark:text-goldAccent shadow-sm'
                                  : 'border-rosegold/20 dark:border-goldAccent/15 hover:bg-cream/10 dark:hover:bg-darkcard/20 opacity-70'
                              }`}
                            >
                              <Icon className="w-5 h-5 mb-2" />
                              <span className="text-[10px] sm:text-xs tracking-wide">{method.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Payment Fields Container */}
                      <div className="p-5 rounded-2xl bg-cream/10 dark:bg-darkcard/20 border border-rosegold/10 dark:border-goldAccent/10">
                        {paymentMethod === 'card' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold opacity-70">Payment Gateway</span>
                              <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold uppercase tracking-wider text-[8px] px-2 py-0.5 rounded-full">
                                stripe test mode
                              </span>
                            </div>
                            <p className="text-xs opacity-60">
                              Simulates a complete secure card integration. Clicking the button below opens the Stripe overlay secure modal to enter card details and process the payment.
                            </p>
                            <div className="flex items-center gap-3 bg-rosegold/5 dark:bg-goldAccent/5 p-4 rounded-xl border border-rosegold/10 dark:border-goldAccent/10">
                              <FiCreditCard className="w-5 h-5 text-rosegold dark:text-goldAccent flex-shrink-0" />
                              <p className="text-[10px] opacity-70 leading-normal">
                                Card options will appear in a secure sandbox overlay. Standard Stripe test cards (e.g. 4242 4242...) can be used to simulate verification logs.
                              </p>
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'upi' && (
                          <div className="space-y-5">
                            {/* UPI QR Scanner Design */}
                            <div className="flex flex-col items-center justify-center py-4 bg-white/40 dark:bg-black/15 rounded-2xl border border-rosegold/10">
                              <span className="text-[9px] uppercase tracking-widest opacity-60 font-bold mb-3">Scan QR Code</span>
                              
                              {/* QR Image with Animated Laser Line */}
                              <div className="relative w-40 h-40 p-2 bg-white rounded-xl shadow-md border border-rosegold/20 flex items-center justify-center overflow-hidden">
                                <div className="laser-line" />
                                {/* Modern SVG QR Code */}
                                <svg width="130" height="130" viewBox="0 0 100 100" className="text-darkbg">
                                  <rect width="20" height="20" x="5" y="5" fill="currentColor" />
                                  <rect width="10" height="10" x="10" y="10" fill="white" />
                                  
                                  <rect width="20" height="20" x="75" y="5" fill="currentColor" />
                                  <rect width="10" height="10" x="80" y="10" fill="white" />
                                  
                                  <rect width="20" height="20" x="5" y="75" fill="currentColor" />
                                  <rect width="10" height="10" x="10" y="80" fill="white" />
                                  
                                  {/* Center platform branding box */}
                                  <rect width="26" height="26" x="37" y="37" fill="currentColor" rx="4" />
                                  <text x="50" y="52" fill="white" fontSize="6" fontWeight="bold" textAnchor="middle">EA</text>
                                  
                                  {/* Random QR code pixels */}
                                  <rect x="30" y="10" width="10" height="5" fill="currentColor" />
                                  <rect x="50" y="5" width="5" height="15" fill="currentColor" />
                                  <rect x="65" y="15" width="10" height="5" fill="currentColor" />
                                  <rect x="60" y="25" width="5" height="10" fill="currentColor" />
                                  <rect x="35" y="25" width="15" height="5" fill="currentColor" />
                                  
                                  <rect x="10" y="35" width="15" height="5" fill="currentColor" />
                                  <rect x="25" y="30" width="5" height="15" fill="currentColor" />
                                  
                                  <rect x="70" y="45" width="10" height="10" fill="currentColor" />
                                  <rect x="85" y="35" width="10" height="5" fill="currentColor" />
                                  
                                  <rect x="5" y="60" width="10" height="5" fill="currentColor" />
                                  <rect x="20" y="55" width="10" height="10" fill="currentColor" />
                                  
                                  <rect x="30" y="70" width="5" height="20" fill="currentColor" />
                                  <rect x="45" y="80" width="15" height="5" fill="currentColor" />
                                  <rect x="40" y="65" width="10" height="10" fill="currentColor" />
                                  
                                  <rect x="65" y="75" width="15" height="5" fill="currentColor" />
                                  <rect x="85" y="70" width="10" height="15" fill="currentColor" />
                                  <rect x="75" y="85" width="10" height="10" fill="currentColor" />
                                </svg>
                              </div>
                              
                              <p className="text-[10px] text-rosegold dark:text-goldAccent font-semibold mt-3">Scan with GPay, PhonePe, Paytm or BHIM</p>
                            </div>

                            {/* Copy UPI Section */}
                            <div className="flex items-center justify-between bg-white/20 dark:bg-black/25 p-3 rounded-xl border border-rosegold/15">
                              <div className="flex flex-col">
                                <span className="text-[8px] uppercase tracking-wider opacity-60 font-bold">UPI ID</span>
                                <span className="font-mono text-xs font-bold text-darktext dark:text-white">payments@weddingplatform</span>
                              </div>
                              <button
                                type="button"
                                onClick={handleCopyUpiId}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-rosegold/10 dark:bg-goldAccent/10 border border-rosegold/20 dark:border-goldAccent/25 text-rosegold dark:text-goldAccent font-bold text-[9px] uppercase tracking-wider rounded-lg hover:bg-rosegold/15 dark:hover:bg-goldAccent/15 transition-all cursor-pointer"
                              >
                                {copied ? 'Copied' : 'Copy ID'}
                              </button>
                            </div>

                            {/* Reference Transaction Field */}
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider opacity-70 mb-2">
                                UPI Transaction Reference (UTR / Ref Number)
                              </label>
                              <input
                                type="text"
                                value={upiRef}
                                onChange={(e) => {
                                  setUpiRef(e.target.value.replace(/\D/g, '').slice(0, 12));
                                  if (formErrors.upiRef) setFormErrors(prev => ({ ...prev, upiRef: '' }));
                                }}
                                className={`w-full px-4 py-3 rounded-xl border bg-cream/20 dark:bg-darkcard/40 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-rosegold dark:focus:ring-goldAccent transition-all ${
                                  formErrors.upiRef ? 'border-red-500' : 'border-rosegold/20 dark:border-goldAccent/15'
                                }`}
                                placeholder="E.g., 619283746152 (12-digit number)"
                              />
                              {formErrors.upiRef && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.upiRef}</p>
                              )}
                              <p className="text-[9px] opacity-50 mt-1.5">Please scan the QR code above, make the payment in your app, and enter the 12-digit UTR transaction reference number.</p>
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'netbanking' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold opacity-70">Netbanking Gateway</span>
                              <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-500 font-bold uppercase tracking-wider text-[8px] px-2 py-0.5 rounded-full">
                                simulated bank authorization
                              </span>
                            </div>
                            <p className="text-xs opacity-60">
                              Select your bank from the list. Clicking the pay button will simulate redirecting to your bank's secure page to complete authorization.
                            </p>

                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider opacity-70 mb-2">
                                Select Bank
                              </label>
                              <select
                                value={selectedBank}
                                onChange={(e) => setSelectedBank(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-white dark:bg-darkcard text-sm focus:outline-none focus:ring-1 focus:ring-rosegold dark:focus:ring-goldAccent font-semibold text-darktext dark:text-white"
                              >
                                <option value="">-- Choose Your Bank --</option>
                                <option value="HDFC Bank">HDFC Bank</option>
                                <option value="ICICI Bank">ICICI Bank</option>
                                <option value="State Bank of India">State Bank of India</option>
                                <option value="Axis Bank">Axis Bank</option>
                                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'wallet' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold opacity-70">Mobile Wallet Gateway</span>
                              <span className="inline-flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 text-purple-500 font-bold uppercase tracking-wider text-[8px] px-2 py-0.5 rounded-full">
                                simulated wallet check
                              </span>
                            </div>
                            <p className="text-xs opacity-60">
                              Select your wallet and verify with your registered phone number. A simulated transaction confirmation will be initiated.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider opacity-70 mb-2">
                                  Select Wallet
                                </label>
                                <select
                                  value={selectedWallet}
                                  onChange={(e) => setSelectedWallet(e.target.value)}
                                  className="w-full px-4 py-3 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-white dark:bg-darkcard text-sm focus:outline-none focus:ring-1 focus:ring-rosegold dark:focus:ring-goldAccent font-semibold text-darktext dark:text-white"
                                >
                                  <option value="">-- Choose Wallet --</option>
                                  <option value="Paytm">Paytm Wallet</option>
                                  <option value="PhonePe">PhonePe Wallet</option>
                                  <option value="Amazon Pay">Amazon Pay</option>
                                  <option value="Mobikwik">Mobikwik</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider opacity-70 mb-2">
                                  Mobile Number
                                </label>
                                <input
                                  type="tel"
                                  value={walletPhone}
                                  onChange={(e) => setWalletPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                  className="w-full px-4 py-3 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-white dark:bg-darkcard text-sm focus:outline-none focus:ring-1 focus:ring-rosegold dark:focus:ring-goldAccent text-darktext dark:text-white"
                                  placeholder="9876543210"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pay Button */}
                    <button
                      type="submit"
                      disabled={isProcessing || isUpiVerifying || isNetbankingVerifying || isWalletVerifying}
                      className="w-full flex items-center justify-center gap-2 bg-rosegold hover:bg-rosegold/90 dark:bg-goldAccent dark:hover:bg-goldAccent/90 text-white dark:text-black font-bold uppercase tracking-widest py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                      {isUpiVerifying ? (
                        <>
                          <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-white dark:border-black animate-spin" />
                          Verifying UPI Payment...
                        </>
                      ) : isNetbankingVerifying ? (
                        <>
                          <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-white dark:border-black animate-spin" />
                          Authorizing Netbanking...
                        </>
                      ) : isWalletVerifying ? (
                        <>
                          <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-white dark:border-black animate-spin" />
                          Verifying Wallet Transaction...
                        </>
                      ) : paymentMethod === 'card' ? (
                        <>
                          <FiLock className="w-4 h-4" />
                          Upgrade Now (Stripe checkout)
                        </>
                      ) : paymentMethod === 'upi' ? (
                        <>
                          <FiCheckCircle className="w-4 h-4" />
                          I've Paid (Submit Reference)
                        </>
                      ) : paymentMethod === 'netbanking' ? (
                        <>
                          <FiGlobe className="w-4 h-4" />
                          Pay via Netbanking
                        </>
                      ) : (
                        <>
                          <FiBriefcase className="w-4 h-4" />
                          Pay via Mobile Wallet
                        </>
                      )}
                    </button>

                    <p className="text-center text-[10px] opacity-40 flex items-center justify-center gap-1.5">
                      <FiLock /> 256-Bit SSL Encrypted & Secure Checkout
                    </p>
                  </form>
                </div>
              </div>

              {/* Right Column: Order Summary (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="luxury-card rounded-3xl border border-rosegold/20 dark:border-goldAccent/15 p-6 sm:p-8">
                  <h2 className="font-playfair text-xl font-bold mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4">
                    {/* Item */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-base">{planName}</h3>
                        <p className="text-xs opacity-60">
                          {planName.toLowerCase().includes('featured') || planName.toLowerCase().includes('verification')
                            ? 'One-Time / Add-on Purchase'
                            : `${isYearly ? 'Yearly' : 'Monthly'} Subscription Plan`}
                        </p>
                      </div>
                      <span className="font-semibold text-sm">₹{formatINR(basePrice)}</span>
                    </div>

                    <div className="w-full h-px bg-rosegold/10 dark:bg-goldAccent/10" />

                    {/* Breakdown */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between opacity-80">
                        <span>Base Subtotal</span>
                        <span>₹{formatINR(basePrice)}</span>
                      </div>
                      <div className="flex justify-between opacity-80">
                        <span>CGST + SGST (18%)</span>
                        <span>₹{formatINR(gst)}</span>
                      </div>
                    </div>

                    <div className="w-full h-px bg-rosegold/20 dark:bg-goldAccent/15 my-2" />

                    {/* Total */}
                    <div className="flex justify-between items-end">
                      <span className="font-playfair font-bold text-lg">Total Amount</span>
                      <span className="font-playfair font-bold text-2xl text-rosegold dark:text-goldAccent">
                        ₹{formatINR(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Secure Trust Badge */}
                <div className="p-5 rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/10 dark:bg-darkcard/30 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rosegold/10 dark:bg-goldAccent/10 flex items-center justify-center flex-shrink-0">
                    <FiLock className="w-5 h-5 text-rosegold dark:text-goldAccent" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Guaranteed Secure Checkout</h4>
                    <p className="text-xs opacity-60 leading-relaxed">
                      We utilize bank-level 256-bit encryption technology. Your personal details and card credentials are never stored on our servers.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto luxury-card rounded-3xl border border-rosegold/20 dark:border-goldAccent/15 p-6 sm:p-8 text-center"
            >
              <div className="text-center pb-6 border-b border-rosegold/10 dark:border-goldAccent/10 mb-6">
                <div className="w-16 h-16 bg-sage/20 text-sage dark:bg-sage/35 mx-auto rounded-full flex items-center justify-center mb-4">
                  <FiCheckCircle className="w-10 h-10" />
                </div>
                <h1 className="font-playfair text-3xl font-bold mb-2">
                  Payment Successful!
                </h1>
                <p className="text-sm opacity-70">
                  Your purchase is complete. Below is your branded glassmorphism invoice receipt.
                </p>
              </div>

              {/* Glassmorphism Invoice Card */}
              <div className="relative overflow-hidden backdrop-blur-md bg-white/20 dark:bg-black/25 border border-rosegold/15 dark:border-goldAccent/10 rounded-2xl p-6 mb-8 text-left space-y-6 text-sm shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rosegold/10 dark:bg-goldAccent/10 rounded-full blur-2xl pointer-events-none" />
                
                {/* Invoice Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-playfair text-xl font-bold text-rosegold dark:text-goldAccent tracking-wide">EvenAfter</h2>
                    <p className="text-[10px] opacity-75 font-medium tracking-wider uppercase">Wedding Networks Ltd.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] opacity-60 uppercase tracking-wider block">Invoice Number</span>
                    <span className="font-mono font-bold text-xs">{generatedInvoice?.invoiceNumber}</span>
                  </div>
                </div>

                {/* Billed To / Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs pb-4 border-b border-rosegold/10">
                  <div>
                    <span className="opacity-60 block mb-1 font-semibold uppercase text-[8px] tracking-wider">Billed To</span>
                    <span className="font-semibold block text-sm">{generatedInvoice?.userName}</span>
                    <span className="opacity-75 block mt-0.5">{generatedInvoice?.userPhone}</span>
                    <span className="opacity-75 block">{generatedInvoice?.userEmail}</span>
                  </div>
                  <div className="text-right">
                    <span className="opacity-60 block mb-1 font-semibold uppercase text-[8px] tracking-wider">Transaction Info</span>
                    <span className="font-semibold block">{new Date(generatedInvoice?.createdAt).toLocaleString()}</span>
                    <span className="opacity-75 block mt-0.5">Method: <strong>{generatedInvoice?.paymentMethod}</strong></span>
                    <span className="opacity-75 block font-mono">ID: {generatedInvoice?.transactionId}</span>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between font-bold border-b border-rosegold/10 pb-2 text-[9px] uppercase tracking-wider opacity-60">
                    <span>Description</span>
                    <span>Amount</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{planName} Subscription Plan ({isYearly ? 'Yearly' : 'Monthly'})</span>
                    <span className="font-semibold">₹{formatINR(basePrice)}</span>
                  </div>
                  <div className="flex justify-between opacity-80 pl-2">
                    <span>Base Amount</span>
                    <span>₹{formatINR(basePrice)}</span>
                  </div>
                  <div className="flex justify-between opacity-80 pl-2">
                    <span>CGST + SGST (18% GST)</span>
                    <span>₹{formatINR(gst)}</span>
                  </div>
                  
                  {/* Totals Section */}
                  <div className="flex justify-between font-bold text-sm pt-3 border-t border-rosegold/10 text-rosegold dark:text-goldAccent">
                    <span>Total Amount Paid</span>
                    <span>₹{formatINR(totalAmount)}</span>
                  </div>
                </div>

                {/* Stamp */}
                <div className="pt-2 flex justify-between items-center text-[10px] opacity-75">
                  <span>Payment Status: <strong className="text-emerald-500 uppercase font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">SUCCESSFUL</strong></span>
                  <span className="font-playfair italic">Thank you for your business!</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <button
                  onClick={handleDownloadInvoice}
                  className="flex items-center justify-center gap-1.5 border-2 border-rosegold/30 dark:border-goldAccent/30 text-rosegold dark:text-goldAccent font-bold uppercase tracking-wider text-[10px] py-3 rounded-xl hover:bg-rosegold/5 dark:hover:bg-goldAccent/5 transition-all cursor-pointer"
                >
                  <FiDownload className="w-3.5 h-3.5" />
                  Download PDF
                </button>

                <button
                  onClick={handleDownloadInvoice}
                  className="flex items-center justify-center gap-1.5 border-2 border-rosegold/30 dark:border-goldAccent/30 text-rosegold dark:text-goldAccent font-bold uppercase tracking-wider text-[10px] py-3 rounded-xl hover:bg-rosegold/5 dark:hover:bg-goldAccent/5 transition-all cursor-pointer"
                >
                  <FiPrinter className="w-3.5 h-3.5" />
                  Print Invoice
                </button>

                <button
                  onClick={handleEmailInvoice}
                  disabled={isEmailing}
                  className="flex items-center justify-center gap-1.5 border-2 border-rosegold/30 dark:border-goldAccent/30 text-rosegold dark:text-goldAccent font-bold uppercase tracking-wider text-[10px] py-3 rounded-xl hover:bg-rosegold/5 dark:hover:bg-goldAccent/5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiMail className="w-3.5 h-3.5" />
                  Email Invoice
                </button>
              </div>

              {/* Redirection triggers */}
              <div>
                {user ? (
                  <button
                    onClick={handleDashboardRedirect}
                    className="w-full flex items-center justify-center gap-2 bg-rosegold hover:bg-rosegold/90 dark:bg-goldAccent dark:hover:bg-goldAccent/90 text-white dark:text-black font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-md transition-all duration-300 cursor-pointer"
                  >
                    Go to Dashboard
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    to={getRegisterLink()}
                    className="w-full flex items-center justify-center gap-2 bg-rosegold hover:bg-rosegold/90 dark:bg-goldAccent dark:hover:bg-goldAccent/90 text-white dark:text-black font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-md transition-all duration-300"
                  >
                    Register Account & Activate Subscription
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stripe checkout modal simulation overlay */}
      <AnimatePresence>
        {showStripeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-darkcard w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-rosegold/20"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/10">
                <div className="flex items-center gap-2">
                  {/* Stripe simulated logo */}
                  <span className="font-bold text-xl text-[#635BFF] tracking-wide font-sans">stripe</span>
                  <span className="bg-amber-500/10 text-amber-500 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border border-amber-500/20 rounded-full">
                    Test Mode
                  </span>
                </div>
                {stripeStep === 'input' && (
                  <button
                    onClick={() => setShowStripeModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Modal content */}
              <div className="p-6 relative">
                {stripeStep === 'input' ? (
                  <div className="space-y-4">
                    {/* Summary banner */}
                    <div className="bg-[#635BFF]/5 p-4 rounded-xl border border-[#635BFF]/15">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-600 dark:text-gray-400">Subscribe to {planName}</span>
                        <span className="text-[#635BFF] dark:text-[#8f8aff]">₹{formatINR(totalAmount)}</span>
                      </div>
                    </div>

                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Card Information</h3>
                    
                    {/* Card fields */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Card Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={stripeCard.number}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
                              setStripeCard(prev => ({ ...prev, number: val }));
                              if (stripeErrors.number) setStripeErrors(prev => ({ ...prev, number: '' }));
                            }}
                            className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-darkbg text-sm rounded-lg border focus:outline-none focus:border-[#635BFF] ${
                              stripeErrors.number ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'
                            }`}
                            placeholder="4242 4242 4242 4242"
                          />
                          <FiCreditCard className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
                        </div>
                        {stripeErrors.number && <p className="text-red-500 text-[10px] mt-1">{stripeErrors.number}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Expiration Date</label>
                          <input
                            type="text"
                            value={stripeCard.expiry}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\//g, '').replace(/(\d{2})/g, '$1/').trim().slice(0, 5);
                              setStripeCard(prev => ({ ...prev, expiry: val.endsWith('/') ? val.slice(0, -1) : val }));
                              if (stripeErrors.expiry) setStripeErrors(prev => ({ ...prev, expiry: '' }));
                            }}
                            className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-darkbg text-sm rounded-lg border focus:outline-none focus:border-[#635BFF] ${
                              stripeErrors.expiry ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'
                            }`}
                            placeholder="MM/YY"
                          />
                          {stripeErrors.expiry && <p className="text-red-500 text-[10px] mt-1">{stripeErrors.expiry}</p>}
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">CVC</label>
                          <input
                            type="password"
                            value={stripeCard.cvc}
                            onChange={(e) => {
                              setStripeCard(prev => ({ ...prev, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) }));
                              if (stripeErrors.cvc) setStripeErrors(prev => ({ ...prev, cvc: '' }));
                            }}
                            className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-darkbg text-sm rounded-lg border focus:outline-none focus:border-[#635BFF] ${
                              stripeErrors.cvc ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'
                            }`}
                            placeholder="123"
                          />
                          {stripeErrors.cvc && <p className="text-red-500 text-[10px] mt-1">{stripeErrors.cvc}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Country</label>
                          <select className="w-full px-3 py-2.5 bg-gray-50 dark:bg-darkbg text-xs rounded-lg border border-gray-200 dark:border-gray-800 focus:outline-none">
                            <option>India</option>
                            <option>United States</option>
                            <option>United Kingdom</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Postal Code</label>
                          <input
                            type="text"
                            value={stripeCard.zip}
                            onChange={(e) => {
                              setStripeCard(prev => ({ ...prev, zip: e.target.value.replace(/\D/g, '').slice(0, 6) }));
                              if (stripeErrors.zip) setStripeErrors(prev => ({ ...prev, zip: '' }));
                            }}
                            className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-darkbg text-sm rounded-lg border focus:outline-none focus:border-[#635BFF] ${
                              stripeErrors.zip ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'
                            }`}
                            placeholder="400001"
                          />
                          {stripeErrors.zip && <p className="text-red-500 text-[10px] mt-1">{stripeErrors.zip}</p>}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleStripePayment}
                      className="w-full mt-6 py-3 bg-[#635BFF] hover:bg-[#5249ea] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer"
                    >
                      Pay ₹{formatINR(totalAmount)}
                    </button>
                  </div>
                ) : (
                  /* Stripe Loading / Success Screen overlay */
                  <div className="flex flex-col items-center justify-center py-12 space-y-6">
                    {stripeStep === 'processing' && (
                      <>
                        <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-[#635BFF] animate-spin" />
                        <div className="text-center">
                          <h4 className="font-bold text-sm text-gray-800 dark:text-white">Processing Payment...</h4>
                          <p className="text-xs opacity-60 mt-1">Initiating secure sandbox transaction logs</p>
                        </div>
                      </>
                    )}
                    {stripeStep === 'verifying' && (
                      <>
                        <div className="w-12 h-12 rounded-full border-4 border-[#635BFF]/30 border-r-[#635BFF] animate-spin" />
                        <div className="text-center">
                          <h4 className="font-bold text-sm text-gray-800 dark:text-white">Verifying Transaction...</h4>
                          <p className="text-xs opacity-60 mt-1">Confirming authorization credentials with mock gateway</p>
                        </div>
                      </>
                    )}
                    {stripeStep === 'success' && (
                      <>
                        <motion.div
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-16 h-16 bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/30 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <FiCheck className="w-8 h-8 stroke-[3]" />
                        </motion.div>
                        <div className="text-center animate-bounce">
                          <h4 className="font-bold text-sm text-emerald-500">Payment Successful</h4>
                          <p className="text-xs opacity-60 mt-1">Authenticating and activating purchased tiers</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Modal footer secure tagline */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-black/10 text-[10px] text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1.5 border-t border-gray-100 dark:border-gray-800">
                <FiLock className="w-3.5 h-3.5" /> Powered by Stripe | Secure SSL Checkout
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Billing;
