import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Inventory as InventoryIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  AddBox as AddBoxIcon,
  Remove as RemoveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAppContext, InventoryItem } from '../../context/AppContext';
import { apiService } from '../../services/api';

interface InventoryFormData {
  name: string;
  category: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  value: number;
  quantity: number;
}

interface StockFormData {
  quantity: number;
  operation: 'add' | 'remove';
}

const categories = ['Bilgisayar', 'Ofis Ekipmanı', 'İletişim', 'Mobilya', 'Araç Gereçleri', 'Diğer'];

const Inventory: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Dialog states
  const [open, setOpen] = useState(false);
  const [stockDialog, setStockDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItem, setMenuItem] = useState<InventoryItem | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form hooks
  const { control, handleSubmit, reset, formState: { errors } } = useForm<InventoryFormData>();
  const stockForm = useForm<StockFormData>();

  useEffect(() => {
    const loadInventory = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const inventory = await apiService.getInventory();
        dispatch({ type: 'SET_INVENTORY', payload: inventory });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Envanter yüklenirken hata oluştu' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadInventory();
  }, [dispatch]);

  const handleOpen = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      reset(item);
    } else {
      setEditingItem(null);
      reset({
        name: '',
        category: '',
        brand: '',
        model: '',
        serialNumber: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        value: 0,
        quantity: 1,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
    reset();
  };

  const handleStockOpen = (item: InventoryItem) => {
    setSelectedItem(item);
    stockForm.reset({ quantity: 1, operation: 'add' });
    setStockDialog(true);
  };

  const handleStockClose = () => {
    setStockDialog(false);
    setSelectedItem(null);
    stockForm.reset();
  };

  const onSubmit = async (data: InventoryFormData) => {
    try {
      if (editingItem) {
        const updatedItem = await apiService.updateInventoryItem(editingItem.id, data);
        dispatch({ type: 'UPDATE_INVENTORY', payload: updatedItem });
        setSnackbar({ open: true, message: 'Envanter öğesi başarıyla güncellendi!', severity: 'success' });
      } else {
        const newItem = await apiService.createInventoryItem(data);
        dispatch({ type: 'ADD_INVENTORY', payload: newItem });
        setSnackbar({ open: true, message: 'Envanter öğesi başarıyla eklendi!', severity: 'success' });
      }
      handleClose();
    } catch (error) {
      setSnackbar({ open: true, message: 'İşlem sırasında hata oluştu!', severity: 'error' });
    }
  };

  const handleStockUpdate = async (data: StockFormData) => {
    if (!selectedItem) return;

    try {
      const newQuantity = data.operation === 'add' 
        ? selectedItem.quantity + data.quantity
        : Math.max(0, selectedItem.quantity - data.quantity);

      const updatedItem = await apiService.updateInventoryItem(selectedItem.id, {
        ...selectedItem,
        quantity: newQuantity,
      });

      dispatch({ type: 'UPDATE_INVENTORY', payload: updatedItem });
      setSnackbar({ 
        open: true, 
        message: `Stok ${data.operation === 'add' ? 'eklendi' : 'azaltıldı'}!`, 
        severity: 'success' 
      });
      handleStockClose();
    } catch (error) {
      setSnackbar({ open: true, message: 'Stok güncellenirken hata oluştu!', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu envanter öğesini silmek istediğinizden emin misiniz?')) {
      try {
        await apiService.deleteInventoryItem(id);
        dispatch({ type: 'DELETE_INVENTORY', payload: id });
        setSnackbar({ open: true, message: 'Envanter öğesi başarıyla silindi!', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Silme işlemi sırasında hata oluştu!', severity: 'error' });
      }
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: InventoryItem) => {
    setAnchorEl(event.currentTarget);
    setMenuItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItem(null);
  };

  // Filter inventory items
  const filteredInventory = state.inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockColor = (quantity: number) => {
    if (quantity === 0) return 'error';
    if (quantity <= 5) return 'warning';
    return 'success';
  };

  const getStockText = (quantity: number) => {
    if (quantity === 0) return 'Stokta Yok';
    if (quantity <= 5) return 'Az Stok';
    return 'Stokta Var';
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"}
          sx={{ fontWeight: 'bold', mb: 1 }}
        >
          Envanter Yönetimi
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Toplam {state.inventory.length} öğe • {filteredInventory.length} gösteriliyor
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size={isMobile ? "small" : "medium"}
              placeholder="Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={categoryFilter}
                label="Kategori"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="">Tümü</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={5}>
            <Box display="flex" gap={1} justifyContent={{ xs: 'stretch', md: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                }}
                size={isMobile ? "small" : "medium"}
                fullWidth={isMobile}
              >
                Temizle
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
                size={isMobile ? "small" : "medium"}
                fullWidth={isMobile}
              >
                Yeni Öğe
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Inventory Grid/List */}
      {isMobile ? (
        // Mobile List View
        <List>
          {filteredInventory.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem
                sx={{
                  bgcolor: 'background.paper',
                  mb: 1,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {item.name}
                      </Typography>
                      <Chip
                        label={`${item.quantity} adet`}
                        color={getStockColor(item.quantity)}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" display="block">
                        {item.brand} {item.model}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Kategori: {item.category}
                      </Typography>
                      <Typography variant="caption" display="block" color="primary">
                        ₺{item.value.toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => handleMenuOpen(e, item)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      ) : (
        // Desktop/Tablet Card View
        <Grid container spacing={2}>
          {filteredInventory.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <InventoryIcon color="primary" />
                    <Chip
                      label={getStockText(item.quantity)}
                      color={getStockColor(item.quantity)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="h6" component="h3" gutterBottom noWrap>
                    {item.name}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {item.brand} {item.model}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Kategori: {item.category}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    Seri No: {item.serialNumber}
                  </Typography>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography variant="h6" color="primary">
                      ₺{item.value.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {item.quantity} adet
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    <Tooltip title="Stok Güncelle">
                      <IconButton
                        size="small"
                        onClick={() => handleStockOpen(item)}
                        color="primary"
                      >
                        <AddBoxIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzenle">
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(item)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Tooltip title="Sil">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(item.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {filteredInventory.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {searchTerm || categoryFilter ? 'Arama kriterlerine uygun öğe bulunamadı' : 'Henüz envanter öğesi eklenmemiş'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{ mt: 2 }}
          >
            İlk Öğeyi Ekle
          </Button>
        </Paper>
      )}

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => handleOpen()}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (menuItem) handleStockOpen(menuItem);
          handleMenuClose();
        }}>
          <AddBoxIcon sx={{ mr: 1 }} />
          Stok Güncelle
        </MenuItem>
        <MenuItem onClick={() => {
          if (menuItem) handleOpen(menuItem);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Düzenle
        </MenuItem>
        <MenuItem onClick={() => {
          if (menuItem) handleDelete(menuItem.id);
          handleMenuClose();
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Sil
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingItem ? 'Envanter Öğesi Düzenle' : 'Yeni Envanter Öğesi Ekle'}
            {isMobile && (
              <IconButton
                onClick={handleClose}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Öğe adı gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Öğe Adı"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: 'Kategori gereklidir' }}
                  render={({ field }) => (
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Kategori</InputLabel>
                      <Select {...field} label="Kategori">
                        {categories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="brand"
                  control={control}
                  rules={{ required: 'Marka gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Marka"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!errors.brand}
                      helperText={errors.brand?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="model"
                  control={control}
                  rules={{ required: 'Model gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Model"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!errors.model}
                      helperText={errors.model?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="serialNumber"
                  control={control}
                  rules={{ required: 'Seri numarası gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Seri Numarası"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!errors.serialNumber}
                      helperText={errors.serialNumber?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="purchaseDate"
                  control={control}
                  rules={{ required: 'Satın alma tarihi gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Satın Alma Tarihi"
                      type="date"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.purchaseDate}
                      helperText={errors.purchaseDate?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="value"
                  control={control}
                  rules={{ 
                    required: 'Değer gereklidir',
                    min: { value: 0, message: 'Değer 0\'dan büyük olmalıdır' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Değer (₺)"
                      type="number"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!errors.value}
                      helperText={errors.value?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="quantity"
                  control={control}
                  rules={{ 
                    required: 'Miktar gereklidir',
                    min: { value: 0, message: 'Miktar 0\'dan büyük olmalıdır' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Miktar"
                      type="number"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!errors.quantity}
                      helperText={errors.quantity?.message}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
            <Button 
              onClick={handleClose}
              size={isMobile ? "small" : "medium"}
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              size={isMobile ? "small" : "medium"}
            >
              {editingItem ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Stock Update Dialog */}
      <Dialog 
        open={stockDialog} 
        onClose={handleStockClose} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <form onSubmit={stockForm.handleSubmit(handleStockUpdate)}>
          <DialogTitle>
            Stok Güncelle - {selectedItem?.name}
            {isMobile && (
              <IconButton
                onClick={handleStockClose}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Mevcut Stok: {selectedItem?.quantity} adet
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Controller
                    name="operation"
                    control={stockForm.control}
                    defaultValue="add"
                    render={({ field }) => (
                      <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                        <InputLabel>İşlem</InputLabel>
                        <Select {...field} label="İşlem">
                          <MenuItem value="add">Stok Ekle</MenuItem>
                          <MenuItem value="remove">Stok Azalt</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="quantity"
                    control={stockForm.control}
                    rules={{ 
                      required: 'Miktar gereklidir',
                      min: { value: 1, message: 'Miktar 1\'den büyük olmalıdır' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Miktar"
                        type="number"
                        fullWidth
                        size={isMobile ? "small" : "medium"}
                        error={!!stockForm.formState.errors.quantity}
                        helperText={stockForm.formState.errors.quantity?.message}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
            <Button 
              onClick={handleStockClose}
              size={isMobile ? "small" : "medium"}
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              size={isMobile ? "small" : "medium"}
            >
              Güncelle
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Inventory;