import { FormControl } from "@angular/forms";
// first solution
//  export const testingFormControls = {c00: new FormControl(3),c01: new FormControl(),c02: new FormControl(4),c03: new FormControl(),c04: new FormControl(),c05: new FormControl(6),c06: new FormControl(),c07: new FormControl(),c08: new FormControl(), c10: new FormControl(),c11: new FormControl(6),c12: new FormControl(),c13: new FormControl(),c14: new FormControl(),c15: new FormControl(),c16: new FormControl(),c17: new FormControl(),c18: new FormControl(), c20: new FormControl(),c21: new FormControl(),c22: new FormControl(),c23: new FormControl(),c24: new FormControl(7),c25: new FormControl(),c26: new FormControl(2),c27: new FormControl(5),c28: new FormControl(), c30: new FormControl(),c31: new FormControl(),c32: new FormControl(),c33: new FormControl(2),c34: new FormControl(),c35: new FormControl(9),c36: new FormControl(7),c37: new FormControl(),c38: new FormControl(), c40: new FormControl(),c41: new FormControl(),c42: new FormControl(),c43: new FormControl(6),c44: new FormControl(8),c45: new FormControl(5),c46: new FormControl(),c47: new FormControl(),c48: new FormControl(), c50: new FormControl(),c51: new FormControl(2),c52: new FormControl(),c53: new FormControl(),c54: new FormControl(),c55: new FormControl(),c56: new FormControl(),c57: new FormControl(9),c58: new FormControl(), c60: new FormControl(9),c61: new FormControl(),c62: new FormControl(1),c63: new FormControl(),c64: new FormControl(),c65: new FormControl(),c66: new FormControl(4),c67: new FormControl(),c68: new FormControl(), c70: new FormControl(),c71: new FormControl(),c72: new FormControl(8),c73: new FormControl(),c74: new FormControl(4),c75: new FormControl(),c76: new FormControl(),c77: new FormControl(1),c78: new FormControl(5), c80: new FormControl(),c81: new FormControl(),c82: new FormControl(),c83: new FormControl(),c84: new FormControl(),c85: new FormControl(),c86: new FormControl(),c87: new FormControl(),c88: new FormControl(3)}
 //second solution
 export const testingFormControls = {c00: new FormControl(),c01: new FormControl(5),c02: new FormControl(),c03: new FormControl(6),c04: new FormControl(),c05: new FormControl(3),c06: new FormControl(),c07: new FormControl(),c08: new FormControl(), c10: new FormControl(),c11: new FormControl(8),c12: new FormControl(),c13: new FormControl(),c14: new FormControl(),c15: new FormControl(),c16: new FormControl(9),c17: new FormControl(4),c18: new FormControl(), c20: new FormControl(),c21: new FormControl(),c22: new FormControl(),c23: new FormControl(),c24: new FormControl(),c25: new FormControl(),c26: new FormControl(1),c27: new FormControl(),c28: new FormControl(), c30: new FormControl(),c31: new FormControl(),c32: new FormControl(8),c33: new FormControl(),c34: new FormControl(),c35: new FormControl(),c36: new FormControl(4),c37: new FormControl(7),c38: new FormControl(), c40: new FormControl(),c41: new FormControl(7),c42: new FormControl(),c43: new FormControl(),c44: new FormControl(2),c45: new FormControl(9),c46: new FormControl(),c47: new FormControl(),c48: new FormControl(), c50: new FormControl(),c51: new FormControl(),c52: new FormControl(5),c53: new FormControl(3),c54: new FormControl(),c55: new FormControl(),c56: new FormControl(),c57: new FormControl(),c58: new FormControl(), c60: new FormControl(),c61: new FormControl(),c62: new FormControl(),c63: new FormControl(),c64: new FormControl(),c65: new FormControl(),c66: new FormControl(),c67: new FormControl(),c68: new FormControl(4), c70: new FormControl(),c71: new FormControl(3),c72: new FormControl(6),c73: new FormControl(),c74: new FormControl(),c75: new FormControl(5),c76: new FormControl(),c77: new FormControl(),c78: new FormControl(2), c80: new FormControl(8),c81: new FormControl(),c82: new FormControl(),c83: new FormControl(1),c84: new FormControl(9),c85: new FormControl(),c86: new FormControl(),c87: new FormControl(),c88: new FormControl()}
// export const testingFormControls = {
//c00: new FormControl(3),
//c01: new FormControl(),
//c02: new FormControl(4),
//c03: new FormControl(),
//c04: new FormControl(),
//c05: new FormControl(6),
//c06: new FormControl(),
//c07: new FormControl(),
//c08: new FormControl(),

//c10: new FormControl(),
//c11: new FormControl(6),
//c12: new FormControl(),
//c13: new FormControl(),
//c14: new FormControl(),
//c15: new FormControl(),
//c16: new FormControl(),
//c17: new FormControl(),
//c18: new FormControl(),

//c20: new FormControl(),
//c21: new FormControl(),
//c22: new FormControl(),
//c23: new FormControl(),
//c24: new FormControl(7),
//c25: new FormControl(),
//c26: new FormControl(2),
//c27: new FormControl(5),
//c28: new FormControl(),

//c30: new FormControl(),
//c31: new FormControl(),
//c32: new FormControl(),
//c33: new FormControl(2),
//c34: new FormControl(),
//c35: new FormControl(9),
//c36: new FormControl(7),
//c37: new FormControl(),
//c38: new FormControl(),

//c40: new FormControl(),
//c41: new FormControl(),
//c42: new FormControl(),
//c43: new FormControl(6),
//c44: new FormControl(8),
//c45: new FormControl(5),
//c46: new FormControl(),
//c47: new FormControl(),
//c48: new FormControl(),

//c50: new FormControl(),
//c51: new FormControl(2),
//c52: new FormControl(),
//c53: new FormControl(),
//c54: new FormControl(),
//c55: new FormControl(),
//c56: new FormControl(),
//c57: new FormControl(9),
//c58: new FormControl(),

//c60: new FormControl(9),
//c61: new FormControl(),
//c62: new FormControl(1),
//c63: new FormControl(),
//c64: new FormControl(),
//c65: new FormControl(),
//c66: new FormControl(4),
//c67: new FormControl(),
//c68: new FormControl(),

//c70: new FormControl(),
//c71: new FormControl(),
//c72: new FormControl(8),
//c73: new FormControl(),
//c74: new FormControl(4),
//c75: new FormControl(),
//c76: new FormControl(),
//c77: new FormControl(1),
//c78: new FormControl(5),

//c80: new FormControl(),
//c81: new FormControl(),
//c82: new FormControl(),
//c83: new FormControl(),
//c84: new FormControl(),
//c85: new FormControl(),
//c86: new FormControl(),
//c87: new FormControl(),
//c88: new FormControl(3),
//   }