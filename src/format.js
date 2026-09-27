const baht = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' });

export const money = (amount) => baht.format(amount);
