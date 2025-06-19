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
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  InputAdornment,
  Tooltip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  DirectionsCar as CarIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Speed as SpeedIcon,
  Inventory as InventoryIcon,
  AddBox as AddBoxIcon,
  RemoveCircle as RemoveIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAppContext, Vehicle } from '../../context/AppContext';
import { apiService } from '../../services/api';

interface VehicleFormData {
  brand: string;
  model: string;
  year: number;
  plate: string;
  type: string;
}

const vehicleTypes = ['Otomobil', 'Kamyonet', 'Kamyon', 'Minibüs', 'Otobüs', 'Motosiklet'];

const Vehicles: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Dialog states
  const [open, setOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [inventoryDialog, setInventoryDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuVehicle, setMenuVehicle] = useState<Vehicle | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form hook
  const { control, handleSubmit, reset, formState: { errors } } = useForm<VehicleFormData>();

  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const [vehicles, inventory] = await Promise.all([
          apiService.getVehicles(),
          apiService.getInventory()
        ]);
        dispatch({ type: 'SET_VEHICLES', payload: vehicles });
        dispatch({ type: 'SET_INVENTORY', payload: inventory });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Veriler yüklenirken hata oluştu' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, [dispatch]);

  const handleOpen = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      reset(vehicle);
    } else {
      setEditingVehicle(null);
      reset({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        plate: '',
        type: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingVehicle(null);
    reset();
  };

  const onSubmit = async (data: VehicleFormData) => {
    try {
      if (editingVehicle) {
        const updatedVehicle = await apiService.updateVehicle(editingVehicle.id, {
          ...data,
          inventoryItems: editingVehicle.inventoryItems,
        });
        dispatch({ type: 'UPDATE_VEHICLE', payload: updatedVehicle });
        setSnackbar({ open: true, message: 'Araç başarıyla güncellendi!', severity: 'success' });
      } else {
        const newVehicle = await apiService.createVehicle({
          ...data,
          inventoryItems: [],
        });
        dispatch({ type: 'ADD_VEHICLE', payload: newVehicle });
        setSnackbar({ open: true, message: 'Araç başarıyla eklendi!', severity: 'success' });
      }
      handleClose();
    } catch (error) {
      setSnackbar({ open: true, message: 'İşlem sırasında hata oluştu!', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu aracı silmek istediğinizden emin misiniz?')) {
      try {
        await apiService.deleteVehicle(id);
        dispatch({ type: 'DELETE_VEHICLE', payload: id });
        setSnackbar({ open: true, message: 'Araç başarıyla silindi!', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Silme işlemi sırasında hata oluştu!', severity: 'error' });
      }
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, vehicle: Vehicle) => {
    setAnchorEl(event.currentTarget);
    setMenuVehicle(vehicle);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuVehicle(null);
  };

  // Filter vehicles
  const filteredVehicles = state.vehicles.filter(vehicle => {
    const matchesSearch = vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || vehicle.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getVehicleColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Otomobil': '#1976d2',
      'Kamyonet': '#388e3c',
      'Kamyon': '#f57c00',
      'Minibüs': '#7b1fa2',
      'Otobüs': '#d32f2f',
      'Motosiklet': '#455a64',
    };
    return colors[type] || '#757575';
  };

  const getVehicleAge = (year: number) => {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    if (age === 0) return 'Yeni';
    if (age === 1) return '1 yaşında';
    return `${age} yaşında`;
  };

  const handleInventoryManagement = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setInventoryDialog(true);
    handleMenuClose();
  };

  const handleAddInventoryToVehicle = async (inventoryId: number) => {
    if (!selectedVehicle) return;
    
    try {
      const updatedInventoryItems = [...selectedVehicle.inventoryItems, inventoryId];
      const updatedVehicle = await apiService.updateVehicle(selectedVehicle.id, {
        ...selectedVehicle,
        inventoryItems: updatedInventoryItems
      });
      
      dispatch({ type: 'UPDATE_VEHICLE', payload: updatedVehicle });
      setSelectedVehicle(updatedVehicle);
      setSnackbar({ open: true, message: 'Envanter araca eklendi!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Envanter eklenirken hata oluştu!', severity: 'error' });
    }
  };

  const handleRemoveInventoryFromVehicle = async (inventoryId: number) => {
    if (!selectedVehicle) return;
    
    try {
      const updatedInventoryItems = selectedVehicle.inventoryItems.filter(id => id !== inventoryId);
      const updatedVehicle = await apiService.updateVehicle(selectedVehicle.id, {
        ...selectedVehicle,
        inventoryItems: updatedInventoryItems
      });
      
      dispatch({ type: 'UPDATE_VEHICLE', payload: updatedVehicle });
      setSelectedVehicle(updatedVehicle);
      setSnackbar({ open: true, message: 'Envanter araçtan çıkarıldı!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Envanter çıkarılırken hata oluştu!', severity: 'error' });
    }
  };

  const getInventoryInfo = (inventoryId: number) => {
    return state.inventory.find(item => item.id === inventoryId);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"}
          sx={{ fontWeight: 'bold', mb: 1 }}
        >
          Araç Yönetimi
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Toplam {state.vehicles.length} araç • {filteredVehicles.length} gösteriliyor
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size={isMobile ? "small" : "medium"}
              placeholder="Marka, model veya plaka ara..."
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
              <InputLabel>Araç Tipi</InputLabel>
              <Select
                value={typeFilter}
                label="Araç Tipi"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="">Tümü</MenuItem>
                {vehicleTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
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
                  setTypeFilter('');
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
                Yeni Araç
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Vehicles Grid/List */}
      {isMobile ? (
        // Mobile List View
        <List>
          {filteredVehicles.map((vehicle) => (
            <React.Fragment key={vehicle.id}>
              <ListItem
                sx={{
                  bgcolor: 'background.paper',
                  mb: 1,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Avatar
                  sx={{ 
                    bgcolor: getVehicleColor(vehicle.type),
                    mr: 2,
                    width: 40,
                    height: 40,
                  }}
                >
                  <CarIcon />
                </Avatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {vehicle.brand} {vehicle.model}
                      </Typography>
                      <Chip
                        label={vehicle.type}
                        size="small"
                        sx={{ bgcolor: getVehicleColor(vehicle.type), color: 'white' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" display="block" fontWeight="bold">
                        {vehicle.plate}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {vehicle.year} • {getVehicleAge(vehicle.year)}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {vehicle.inventoryItems.length} envanter öğesi
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => handleMenuOpen(e, vehicle)}
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
          {filteredVehicles.map((vehicle) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={vehicle.id}>
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
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Avatar
                      sx={{ 
                        bgcolor: getVehicleColor(vehicle.type),
                        width: 48,
                        height: 48,
                      }}
                    >
                      <CarIcon />
                    </Avatar>
                    <Chip
                      label={vehicle.type}
                      sx={{ bgcolor: getVehicleColor(vehicle.type), color: 'white' }}
                    />
                  </Box>
                  
                  <Typography variant="h6" component="h3" gutterBottom>
                    {vehicle.brand} {vehicle.model}
                  </Typography>
                  
                  <Typography variant="h5" color="primary" gutterBottom fontWeight="bold">
                    {vehicle.plate}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CalendarIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      {vehicle.year} • {getVehicleAge(vehicle.year)}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1}>
                    <SpeedIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      {vehicle.inventoryItems.length} envanter öğesi
                    </Typography>
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5 }}>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Düzenle">
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(vehicle)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Envanter Yönetimi">
                      <IconButton
                        size="small"
                        onClick={() => handleInventoryManagement(vehicle)}
                        color="secondary"
                      >
                        <InventoryIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Tooltip title="Sil">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(vehicle.id)}
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
      {filteredVehicles.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {searchTerm || typeFilter ? 'Arama kriterlerine uygun araç bulunamadı' : 'Henüz araç eklenmemiş'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{ mt: 2 }}
          >
            İlk Aracı Ekle
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
          if (menuVehicle) handleOpen(menuVehicle);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Düzenle
        </MenuItem>
        <MenuItem onClick={() => {
          if (menuVehicle) handleInventoryManagement(menuVehicle);
        }}>
          <InventoryIcon sx={{ mr: 1 }} />
          Envanter Yönetimi
        </MenuItem>
        <MenuItem onClick={() => {
          if (menuVehicle) handleDelete(menuVehicle.id);
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
            {editingVehicle ? 'Araç Düzenle' : 'Yeni Araç Ekle'}
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
                  name="year"
                  control={control}
                  rules={{ 
                    required: 'Yıl gereklidir',
                    min: { value: 1900, message: 'Geçerli bir yıl giriniz' },
                    max: { value: new Date().getFullYear() + 1, message: 'Geçerli bir yıl giriniz' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Yıl"
                      type="number"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      error={!!errors.year}
                      helperText={errors.year?.message}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="plate"
                  control={control}
                  rules={{ required: 'Plaka gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Plaka"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      placeholder="34 ABC 123"
                      error={!!errors.plate}
                      helperText={errors.plate?.message}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: 'Araç tipi gereklidir' }}
                  render={({ field }) => (
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Araç Tipi</InputLabel>
                      <Select {...field} label="Araç Tipi">
                        {vehicleTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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
              {editingVehicle ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Inventory Management Dialog */}
      <Dialog
        open={inventoryDialog}
        onClose={() => setInventoryDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <InventoryIcon />
              <Typography variant="h6">
                Envanter Yönetimi - {selectedVehicle?.brand} {selectedVehicle?.model}
              </Typography>
            </Box>
            {isMobile && (
              <IconButton onClick={() => setInventoryDialog(false)}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedVehicle && (
            <Box>
              {/* Araçtaki Mevcut Envanterler */}
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Araçtaki Envanterler ({selectedVehicle.inventoryItems.length})
              </Typography>
              {selectedVehicle.inventoryItems.length > 0 ? (
                <List>
                  {selectedVehicle.inventoryItems.map((inventoryId) => {
                    const inventory = getInventoryInfo(inventoryId);
                    if (!inventory) return null;
                    return (
                      <ListItem
                        key={inventoryId}
                        sx={{
                          bgcolor: 'background.paper',
                          mb: 1,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <ListItemText
                          primary={inventory.name}
                          secondary={`${inventory.brand} ${inventory.model} - ${inventory.category}`}
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Araçtan Çıkar">
                            <IconButton
                              edge="end"
                              onClick={() => handleRemoveInventoryFromVehicle(inventoryId)}
                              color="error"
                            >
                              <RemoveIcon />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <InventoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="textSecondary">
                    Bu araçta henüz envanter bulunmuyor
                  </Typography>
                </Paper>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Eklenebilir Envanterler */}
              <Typography variant="h6" gutterBottom>
                Eklenebilir Envanterler
              </Typography>
              {state.inventory.filter(item => !selectedVehicle.inventoryItems.includes(item.id)).length > 0 ? (
                <List>
                  {state.inventory
                    .filter(item => !selectedVehicle.inventoryItems.includes(item.id))
                    .map((inventory) => (
                      <ListItem
                        key={inventory.id}
                        sx={{
                          bgcolor: 'background.paper',
                          mb: 1,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <ListItemText
                          primary={inventory.name}
                          secondary={`${inventory.brand} ${inventory.model} - ${inventory.category} (${inventory.quantity} adet)`}
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Araca Ekle">
                            <IconButton
                              edge="end"
                              onClick={() => handleAddInventoryToVehicle(inventory.id)}
                              color="primary"
                            >
                              <AddBoxIcon />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                </List>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <InventoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="textSecondary">
                    Tüm envanterler bu araçta mevcut
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setInventoryDialog(false)}>
            Kapat
          </Button>
        </DialogActions>
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

export default Vehicles;