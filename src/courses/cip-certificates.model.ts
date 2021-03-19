import * as mongoose from 'mongoose';

export const CipCertificatesSchema = new mongoose.Schema({
   CIPTitle: { type: String, required: true },
   CIPCode: { type: String, required: true },
   CIPFamily: { type: String, required: false },
   Action: { type: String, required: false },
   TextChange: { type: String, required: false },
   CIPDefinition: { type: String, required: false },
   CrossReferences: { type: String, required: false },
   Examples: { type: String, required: false },
}, {
  timestamps: true,
});

CipCertificatesSchema.query.paginate = function(page: number, perPage: number) {
  return this.skip( (page - 1) * perPage).limit(perPage);
};

CipCertificatesSchema.query.byKeyword = function(keyword: string) {
  return this.where({CIPTitle: { $regex: keyword, $options: 'i' }});
};
