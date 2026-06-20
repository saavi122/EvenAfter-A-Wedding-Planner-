import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  details: { type: String },
  ipAddress: { type: String }
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
