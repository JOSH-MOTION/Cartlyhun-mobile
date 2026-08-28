import { categoryService, productService, reviewService } from '../services/firestore.js';
import { collection, query, orderBy, getDocs, doc, getDoc, updateDoc, where, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getFlattenedCategories } from './categories';

// Direct Firebase data access functions
export const getCategories = async () => {
  try {
    // Return the hardcoded app categories structure
    return getFlattenedCategories();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const getProducts = async (options = {}) => {
  try {
    const { featured, category, limit, sellerId } = options;
    
    // Get all products without isActive filter
    const productsQuery = query(
      collection(db, 'products'), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(productsQuery);
    
    let products = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (typeof data.createdAt === 'string' ? new Date(data.createdAt) : new Date()),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : new Date()),
      };
    });
    
    // Filter out soft-deleted products (remaining for compatibility with old deletions)
    products = products.filter(product => product.isActive !== false);
    
    // Apply filters
    if (featured) {
      products = products.filter(product => product.isFeatured);
    }
    
    if (category) {
      if (Array.isArray(category)) {
        products = products.filter(product => category.includes(product.categoryId));
      } else {
        products = products.filter(product => product.categoryId === category);
      }
    }
    
    if (sellerId) {
      products = products.filter(product => product.sellerId === sellerId);
    }
    
    if (limit) {
      products = products.slice(0, parseInt(limit));
    }
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const createCategory = async (categoryData) => {
  try {
    const categoryId = await categoryService.create(categoryData);
    return { id: categoryId, success: true };
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const productId = await productService.create(productData);
    return { id: productId, success: true };
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const getProductById = async (productId) => {
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    await productService.update(productId, productData);
    return { success: true };
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const incrementProductViews = async (productId) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      views: increment(1)
    });
    return true;
  } catch (error) {
    if (error.code === 'permission-denied') {
      // Silently fail if rules don't allow direct increment from client
      return false;
    }
    console.error('Error incrementing product views:', error);
    return false;
  }
};

export const deleteProduct = async (productId) => {
  try {
    await productService.delete(productId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    await categoryService.update(categoryId, categoryData);
    return { success: true };
  } catch (error) {
    console.error('Error updating category:', error);
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check Firebase Firestore security rules. Categories collection needs read/write permissions.');
    } else if (error.code === 'not-found') {
      throw new Error('Category not found');
    } else if (error.code === 'unavailable') {
      throw new Error('Firebase service unavailable. Please check your internet connection.');
    } else {
      throw new Error(`Failed to update category: ${error.message}`);
    }
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    await categoryService.delete(categoryId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Seller Helpers
export const getSeller = async (sellerId) => {
  try {
    const sellerRef = doc(db, 'sellers', sellerId);
    const sellerSnap = await getDoc(sellerRef);
    if (sellerSnap.exists()) {
      return { id: sellerSnap.id, ...sellerSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching seller:', error);
    return null;
  }
};

export const getSellerProducts = async (sellerId) => {
  return await getProducts({ sellerId });
};

export const getAllSellers = async () => {
  try {
    const sellersQuery = query(collection(db, 'sellers'), orderBy('storeName'));
    const querySnapshot = await getDocs(sellersQuery);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching all sellers:', error);
    return [];
  }
};

export const incrementStoreViews = async (sellerName) => {
  try {
    const sellersQuery = query(collection(db, 'sellers'), where('storeName', '==', sellerName));
    const snapshot = await getDocs(sellersQuery);
    if (!snapshot.empty) {
      const sellerDoc = snapshot.docs[0];
      await updateDoc(doc(db, 'sellers', sellerDoc.id), {
        storeViews: increment(1)
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error incrementing store views:', error);
    return false;
  }
};

// Review Helpers
export const getProductReviews = async (productId) => {
  try {
    return await reviewService.getByProduct(productId);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const submitReview = async (reviewData) => {
  try {
    return await reviewService.create(reviewData);
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

export const getSellerReviews = async (sellerName) => {
  try {
    return await reviewService.getBySeller(sellerName);
  } catch (error) {
    console.error('Error fetching seller reviews:', error);
    return [];
  }
};
