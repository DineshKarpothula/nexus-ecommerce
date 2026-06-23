import { createSlice } from '@reduxjs/toolkit'

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    featured: [],
    currentProduct: null,
    loading: false,
    error: null,
    totalPages: 1,
    currentPage: 1,
  },
  reducers: {
    setProducts: (state, action) => {
      state.items = action.payload.products
      state.totalPages = action.payload.totalPages
      state.currentPage = action.payload.currentPage
    },
    setFeatured: (state, action) => { state.featured = action.payload },
    setCurrentProduct: (state, action) => { state.currentProduct = action.payload },
    setLoading: (state, action) => { state.loading = action.payload },
    setError: (state, action) => { state.error = action.payload },
  },
})

export const { setProducts, setFeatured, setCurrentProduct, setLoading, setError } = productSlice.actions
export default productSlice.reducer