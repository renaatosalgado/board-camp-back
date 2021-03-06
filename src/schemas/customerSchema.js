import joi from "joi";

const customerSchema = joi.object({
  name: joi.string().trim().required(),
  phone: joi
    .string()
    .pattern(/^[0-9]{10,11}$/)
    .required(),
  cpf: joi
    .string()
    .pattern(/^[0-9]{11}$/)
    .required(),
  birthday: joi
    .string()
    .isoDate(),
});
export default customerSchema;
