import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  InputAdornment,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  History as HistoryIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  KeyboardReturn as ReturnIcon,
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';

interface HistoryItem {
  id: number;
  type: 'personnel' | 'inventory' | 'vehicle' | 'assignment';
  action: 'create' | 'update' | 'delete' | 'assign' | 'return';
  entityId: number;
  entityName: string;
  details: string;
  timestamp: string;
  userId?: number;
}

const History: React.FC = () => {
  const { dispatch } = useAppContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Gerçek API'den history verisi gelene kadar mock data kullanıyoruz
      const mockHistory: HistoryItem[] = [
        {
          id: 1,
          type: 'personnel',
          action: 'create',
          entityId: 1,
          entityName: 'Ahmet Yılmaz',
          details: 'Yeni personel eklendi - IT Departmanı',
          timestamp: new Date().toISOString(),
        },
        {
          id: 2,
          type: 'vehicle',
          action: 'create',
          entityId: 1,
          entityName: 'Toyota Corolla (34 ABC 123)',
          details: 'Yeni araç eklendi',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 3,
          type: 'assignment',
          action: 'assign',
          entityId: 1,
          entityName: 'Ahmet Yılmaz - Toyota Corolla',
          details: 'Araç zimmeti oluşturuldu',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 4,
          type: 'inventory',
          action: 'create',
          entityId: 1,
          entityName: 'Dell Laptop',
          details: 'Yeni envanter öğesi eklendi - 5 adet',
          timestamp: new Date(Date.now() - 259200000).toISOString(),
        },
        {
          id: 5,
          type: 'assignment',
          action: 'return',
          entityId: 2,
          entityName: 'Mehmet Demir - Honda Civic',
          details: 'Araç zimmeti iade edildi',
          timestamp: new Date(Date.now() - 345600000).toISOString(),
        },
      ];
      
      setHistory(mockHistory);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Geçmiş veriler yüklenirken hata oluştu' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Filter history items
  const filteredHistory = history.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = 
      item.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'personnel':
        return <PersonIcon />;
      case 'inventory':
        return <InventoryIcon />;
      case 'vehicle':
        return <CarIcon />;
      case 'assignment':
        return <AssignmentIcon />;
      default:
        return <HistoryIcon />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <AddIcon fontSize="small" />;
      case 'update':
        return <EditIcon fontSize="small" />;
      case 'delete':
        return <DeleteIcon fontSize="small" />;
      case 'assign':
        return <AssignmentIcon fontSize="small" />;
      case 'return':
        return <ReturnIcon fontSize="small" />;
      default:
        return <HistoryIcon fontSize="small" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'personnel':
        return '#1976d2';
      case 'inventory':
        return '#388e3c';
      case 'vehicle':
        return '#f57c00';
      case 'assignment':
        return '#7b1fa2';
      default:
        return '#757575';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'success';
      case 'update':
        return 'info';
      case 'delete':
        return 'error';
      case 'assign':
        return 'primary';
      case 'return':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'create':
        return 'Oluşturuldu';
      case 'update':
        return 'Güncellendi';
      case 'delete':
        return 'Silindi';
      case 'assign':
        return 'Zimmet';
      case 'return':
        return 'İade';
      default:
        return action;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'personnel':
        return 'Personel';
      case 'inventory':
        return 'Envanter';
      case 'vehicle':
        return 'Araç';
      case 'assignment':
        return 'Zimmet';
      default:
        return type;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Bugün';
    } else if (diffDays === 2) {
      return 'Dün';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR');
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"}
          sx={{ fontWeight: 'bold', mb: 1 }}
        >
          İşlem Geçmişi
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Toplam {history.length} işlem • {filteredHistory.length} gösteriliyor
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size={isMobile ? "small" : "medium"}
              placeholder="İşlem ara..."
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
              <InputLabel>İşlem Tipi</InputLabel>
              <Select
                value={filterType}
                label="İşlem Tipi"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="personnel">Personel</MenuItem>
                <MenuItem value="inventory">Envanter</MenuItem>
                <MenuItem value="vehicle">Araç</MenuItem>
                <MenuItem value="assignment">Zimmet</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={5}>
            <Box display="flex" gap={1} justifyContent={{ xs: 'stretch', md: 'flex-end' }}>
              <Tooltip title="Filtreleri Temizle">
                <IconButton
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                  }}
                  size={isMobile ? "small" : "medium"}
                >
                  <FilterIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* History List */}
      {isMobile ? (
        // Mobile List View
        <List>
          {filteredHistory.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem
                sx={{
                  bgcolor: 'background.paper',
                  mb: 1,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  alignItems: 'flex-start',
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{ 
                      bgcolor: getTypeColor(item.type),
                      width: 40,
                      height: 40,
                    }}
                  >
                    {getTypeIcon(item.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {item.entityName}
                      </Typography>
                      <Chip
                        label={getActionText(item.action)}
                        color={getActionColor(item.action) as any}
                        size="small"
                        icon={getActionIcon(item.action)}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {item.details}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={getTypeText(item.type)}
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: getTypeColor(item.type), color: getTypeColor(item.type) }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(item.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      ) : (
        // Desktop/Tablet Card View
        <Grid container spacing={2}>
          {filteredHistory.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Avatar
                      sx={{ 
                        bgcolor: getTypeColor(item.type),
                        width: 40,
                        height: 40,
                      }}
                    >
                      {getTypeIcon(item.type)}
                    </Avatar>
                    <Chip
                      label={getActionText(item.action)}
                      color={getActionColor(item.action) as any}
                      size="small"
                      icon={getActionIcon(item.action)}
                    />
                  </Box>
                  
                  <Typography variant="h6" component="h3" gutterBottom>
                    {item.entityName}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {item.details}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Chip
                      label={getTypeText(item.type)}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: getTypeColor(item.type), color: getTypeColor(item.type) }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {formatDate(item.timestamp)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {filteredHistory.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {searchTerm || filterType !== 'all' ? 'Arama kriterlerine uygun işlem bulunamadı' : 'Henüz işlem geçmişi bulunmuyor'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Sistem kullanımı başladığında işlemler burada görünecektir
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default History;