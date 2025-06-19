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
  ListItemAvatar,
  Tab,
  Tabs,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  KeyboardReturn as ReturnIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAppContext, Assignment } from '../../context/AppContext';
import { apiService } from '../../services/api';

interface AssignmentFormData {
  vehicleId: string;
  personnelId: string;
  assignDate: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`assignment-tabpanel-${index}`}
      aria-labelledby={`assignment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Assignments: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Dialog states
  const [open, setOpen] = useState(false);

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuAssignment, setMenuAssignment] = useState<Assignment | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form hook
  const { control, handleSubmit, reset, formState: { errors } } = useForm<AssignmentFormData>();

  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const [assignments, personnel, vehicles, inventory] = await Promise.all([
          apiService.getAssignments(),
          apiService.getPersonnel(),
          apiService.getVehicles(),
          apiService.getInventory(),
        ]);

        dispatch({ type: 'SET_ASSIGNMENTS', payload: assignments });
        dispatch({ type: 'SET_PERSONNEL', payload: personnel });
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

  const handleOpen = () => {
    reset({
      vehicleId: '',
      personnelId: '',
      assignDate: new Date().toISOString().split('T')[0],
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      const newAssignment = await apiService.createAssignment({
        ...data,
        status: 'active'
      });
      dispatch({ type: 'ADD_ASSIGNMENT', payload: newAssignment });
      setSnackbar({ open: true, message: 'Zimmet başarıyla oluşturuldu!', severity: 'success' });
      handleClose();
    } catch (error) {
      setSnackbar({ open: true, message: 'Zimmet oluşturulurken hata oluştu!', severity: 'error' });
    }
  };

  const handleReturn = async (assignmentId: string) => {
    if (window.confirm('Bu zimmeti iade etmek istediğinizden emin misiniz?')) {
      try {
        const updatedAssignment = await apiService.returnAssignment(parseInt(assignmentId), new Date().toISOString());
        dispatch({ type: 'UPDATE_ASSIGNMENT', payload: updatedAssignment });
        setSnackbar({ open: true, message: 'Zimmet başarıyla iade edildi!', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'İade işlemi sırasında hata oluştu!', severity: 'error' });
      }
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, assignment: Assignment) => {
    setAnchorEl(event.currentTarget);
    setMenuAssignment(assignment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuAssignment(null);
  };

  // Filter assignments
  const filteredAssignments = state.assignments.filter(assignment => {
    const personnel = state.personnel.find(p => p.id === assignment.personnelId);
    const vehicle = state.vehicles.find(v => v.id === assignment.vehicleId);
    
    const matchesSearch = 
      personnel?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      personnel?.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.plate.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const activeAssignments = filteredAssignments.filter(a => a.status === 'active');
  const returnedAssignments = filteredAssignments.filter(a => a.status === 'returned');

  const getPersonnelInfo = (personnelId: string) => {
    return state.personnel.find(p => p.id === personnelId);
  };

  const getVehicleInfo = (vehicleId: string) => {
    return state.vehicles.find(v => v.id === vehicleId);
  };

  const getInventoryInfo = (inventoryId: string) => {
    return state.inventory.find(i => i.id === inventoryId);
  };

  const getInitials = (name: string, surname: string) => {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  const getDaysCount = (date: string) => {
    const assignDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - assignDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderAssignmentCard = (assignment: Assignment) => {
    const personnel = getPersonnelInfo(assignment.personnelId);
    const vehicle = getVehicleInfo(assignment.vehicleId);
    
    if (!personnel || !vehicle) return null;

    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={assignment.id}>
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
                  bgcolor: assignment.status === 'active' ? 'success.main' : 'grey.500',
                  width: 40,
                  height: 40,
                }}
              >
                {getInitials(personnel.name, personnel.surname)}
              </Avatar>
              <Chip
                label={assignment.status === 'active' ? 'Aktif' : 'İade Edildi'}
                color={assignment.status === 'active' ? 'success' : 'default'}
                size="small"
              />
            </Box>
            
            <Typography variant="h6" component="h3" gutterBottom>
              {personnel.name} {personnel.surname}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {personnel.department} • {personnel.position}
            </Typography>
            
            <Divider sx={{ my: 1 }} />
            
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <CarIcon fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight="bold">
                {vehicle.brand} {vehicle.model}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="primary" gutterBottom>
              {vehicle.plate}
            </Typography>
            
            <Box display="flex" alignItems="center" gap={1} mt={2}>
              <CalendarIcon fontSize="small" color="action" />
              <Typography variant="body2" color="textSecondary">
                {new Date(assignment.assignDate).toLocaleDateString('tr-TR')}
              </Typography>
            </Box>
            
            {assignment.status === 'active' && (
              <Typography variant="caption" color="success.main" display="block" mt={1}>
                {getDaysCount(assignment.assignDate)} gündür kullanımda
              </Typography>
            )}
            
            {assignment.returnDate && (
              <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                İade: {new Date(assignment.returnDate).toLocaleDateString('tr-TR')}
              </Typography>
            )}

            {/* Envanter Bilgisi */}
            {assignment.inventoryItems && assignment.inventoryItems.length > 0 && (
              <Box mt={2}>
                <Divider sx={{ mb: 1 }} />
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <InventoryIcon fontSize="small" color="secondary" />
                  <Typography variant="body2" fontWeight="bold" color="secondary">
                    Zimmetli Envanterler ({assignment.inventoryItems.length})
                  </Typography>
                </Box>
                <Box>
                  {assignment.inventoryItems.slice(0, 2).map((inventoryId) => {
                    const inventory = getInventoryInfo(inventoryId);
                    if (!inventory) return null;
                    return (
                      <Typography key={inventoryId} variant="caption" display="block" color="textSecondary">
                        • {inventory.name} ({inventory.brand})
                      </Typography>
                    );
                  })}
                  {assignment.inventoryItems.length > 2 && (
                    <Typography variant="caption" color="textSecondary">
                      +{assignment.inventoryItems.length - 2} daha...
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </CardContent>
          
          {assignment.status === 'active' && (
            <>
              <Divider />
              <CardActions sx={{ justifyContent: 'center', py: 1.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ReturnIcon />}
                  onClick={() => handleReturn(assignment.id)}
                  color="warning"
                >
                  İade Et
                </Button>
              </CardActions>
            </>
          )}
        </Card>
      </Grid>
    );
  };

  const renderAssignmentListItem = (assignment: Assignment) => {
    const personnel = getPersonnelInfo(assignment.personnelId);
    const vehicle = getVehicleInfo(assignment.vehicleId);
    
    if (!personnel || !vehicle) return null;

    return (
      <ListItem
        key={assignment.id}
        sx={{
          bgcolor: 'background.paper',
          mb: 1,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <ListItemAvatar>
          <Avatar
            sx={{ 
              bgcolor: assignment.status === 'active' ? 'success.main' : 'grey.500',
            }}
          >
            {getInitials(personnel.name, personnel.surname)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="subtitle2" fontWeight="bold">
                {personnel.name} {personnel.surname}
              </Typography>
              <Chip
                label={assignment.status === 'active' ? 'Aktif' : 'İade Edildi'}
                color={assignment.status === 'active' ? 'success' : 'default'}
                size="small"
              />
            </Box>
          }
          secondary={
            <Box>
              <Typography variant="caption" display="block">
                {vehicle.brand} {vehicle.model} ({vehicle.plate})
              </Typography>
              <Typography variant="caption" display="block">
                {new Date(assignment.assignDate).toLocaleDateString('tr-TR')}
                {assignment.status === 'active' && ` • ${getDaysCount(assignment.assignDate)} gün`}
              </Typography>
              {assignment.returnDate && (
                <Typography variant="caption" display="block">
                  İade: {new Date(assignment.returnDate).toLocaleDateString('tr-TR')}
                </Typography>
              )}
              {assignment.inventoryItems && assignment.inventoryItems.length > 0 && (
                <Typography variant="caption" display="block" color="secondary.main">
                  📦 {assignment.inventoryItems.length} envanter öğesi
                </Typography>
              )}
            </Box>
          }
        />
        {assignment.status === 'active' && (
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              onClick={(e) => handleMenuOpen(e, assignment)}
            >
              <MoreVertIcon />
            </IconButton>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    );
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"}
          sx={{ fontWeight: 'bold', mb: 1 }}
        >
          Zimmet Yönetimi
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Toplam {state.assignments.length} zimmet • {activeAssignments.length} aktif • {returnedAssignments.length} iade edildi
        </Typography>
      </Box>

      {/* Search and Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8} md={9}>
            <TextField
              fullWidth
              size={isMobile ? "small" : "medium"}
              placeholder="Personel adı, araç markası, model veya plaka ara..."
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
          <Grid item xs={12} sm={4} md={3}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpen}
              size={isMobile ? "small" : "medium"}
              fullWidth
            >
              Yeni Zimmet
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <Tab 
            label={
              <Badge badgeContent={activeAssignments.length} color="success">
                Aktif Zimmetler
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={returnedAssignments.length} color="default">
                İade Edilenler
              </Badge>
            } 
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {isMobile ? (
          <List>
            {activeAssignments.map(renderAssignmentListItem)}
          </List>
        ) : (
          <Grid container spacing={2}>
            {activeAssignments.map(renderAssignmentCard)}
          </Grid>
        )}
        
        {activeAssignments.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {searchTerm ? 'Arama kriterlerine uygun aktif zimmet bulunamadı' : 'Henüz aktif zimmet bulunmuyor'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpen}
              sx={{ mt: 2 }}
            >
              İlk Zimmeti Oluştur
            </Button>
          </Paper>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {isMobile ? (
          <List>
            {returnedAssignments.map(renderAssignmentListItem)}
          </List>
        ) : (
          <Grid container spacing={2}>
            {returnedAssignments.map(renderAssignmentCard)}
          </Grid>
        )}
        
        {returnedAssignments.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {searchTerm ? 'Arama kriterlerine uygun iade edilmiş zimmet bulunamadı' : 'Henüz iade edilmiş zimmet bulunmuyor'}
            </Typography>
          </Paper>
        )}
      </TabPanel>

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleOpen}
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
          if (menuAssignment) handleReturn(menuAssignment.id);
          handleMenuClose();
        }}>
          <ReturnIcon sx={{ mr: 1 }} />
          İade Et
        </MenuItem>
      </Menu>

      {/* Add Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            Yeni Zimmet Oluştur
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
              <Grid item xs={12}>
                <Controller
                  name="personnelId"
                  control={control}
                  rules={{ required: 'Personel seçimi gereklidir' }}
                  render={({ field }) => (
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Personel</InputLabel>
                      <Select {...field} label="Personel">
                        {state.personnel.map((person) => (
                          <MenuItem key={person.id} value={person.id}>
                            {person.name} {person.surname} - {person.department}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="vehicleId"
                  control={control}
                  rules={{ required: 'Araç seçimi gereklidir' }}
                  render={({ field }) => (
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Araç</InputLabel>
                      <Select {...field} label="Araç">
                        {state.vehicles.map((vehicle) => (
                          <MenuItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.brand} {vehicle.model} ({vehicle.plate})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="assignDate"
                  control={control}
                  rules={{ required: 'Zimmet tarihi gereklidir' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Zimmet Tarihi"
                      type="date"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.assignDate}
                      helperText={errors.assignDate?.message}
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
              Oluştur
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

export default Assignments;